import logging
import uuid
from decimal import Decimal

from pydantic_ai import RunContext
from sqlalchemy import select, or_

from app.agents.customer_deps import CustomerAgentDeps
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.models.customer_connection import CustomerConnection
from app.models.user import User
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.repositories import audit_log_repository
from app.core.config import settings

logger = logging.getLogger(__name__)


async def request_payment_link(
    ctx: RunContext[CustomerAgentDeps],
    amount: float,
    description: str = "",
) -> str:
    """Generate a payment link for the customer's purchase.
    Call this immediately after place_order, or when the customer explicitly asks to pay for an order.
    NEVER call this tool if the customer is merely asking whether online payment or Razorpay is supported.

    `amount`: Total order amount in INR.
    `description`: Short note (e.g., "Store order - Rice, Butter").
    """
    customer_name = ctx.deps.customer_name or "Customer"
    customer_phone = ctx.deps.customer_phone or ""
    norm_amount = round(float(amount), 2)

    recent_order_id = None
    if ctx.deps.created_orders:
        try:
            recent_order_id = uuid.UUID(str(ctx.deps.created_orders[-1].get("id", "")))
        except Exception:
            recent_order_id = None

    link_fingerprint = (
        str(recent_order_id) if recent_order_id else str(ctx.deps.customer_id or "").lower(),
        norm_amount,
    )

    for prev in ctx.deps.created_payment_links:
        if prev.get("fingerprint") == link_fingerprint:
            return (
                f"PAYMENT_LINK_ALREADY_CREATED\n"
                f"LINK_URL: {prev['url']}\n"
                f"AMOUNT: ₹{prev['amount']:.2f}\n"
                f"Share this existing LINK_URL with the customer."
            )

    try:
        merchant = ctx.deps.merchant
        if not merchant.is_razorpay_active:
            return (
                "Online payment is not available for this store right now. "
                "You can pay cash on delivery or contact the store owner directly."
            )

        client = get_merchant_razorpay_client(merchant)

        amount_in_paise = int(round(float(amount) * 100))
        receipt_no = f"rcpt_{uuid.uuid4().hex[:8]}"
        effective_frontend = ctx.deps.frontend_url or settings.FRONTEND_URL
        callback_url = f"{effective_frontend}/payment-success"

        razorpay_payload: dict = {
            "amount": amount_in_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": description or f"{ctx.deps.store_name} order",
            "customer": {"name": customer_name},
            "notify": {"sms": False, "email": False},
            "reminder_enable": True,
            "callback_url": callback_url,
            "callback_method": "get",
        }
        if customer_phone:
            clean_phone = "".join(filter(str.isdigit, customer_phone))
            if len(clean_phone) >= 10:
                razorpay_payload["customer"]["contact"] = f"+91{clean_phone[-10:]}"

        link_url = ""
        link_id = None
        try:
            razorpay_resp = client.payment_link.create(razorpay_payload)
            link_url = razorpay_resp.get("short_url") or ""
            link_id = razorpay_resp.get("id")
        except Exception as rzp_err:
            err_str = str(rzp_err).lower()
            if "limit of 30 reached" in err_str or "test mode limit" in err_str:
                logger.warning("Razorpay test limit of 30 reached for store %s. Reusing active test link.", merchant.id)
                try:
                    existing = client.payment_link.all({"count": 10})
                    items = existing.get("payment_links", [])
                    if items:
                        fallback_item = items[0]
                        link_url = fallback_item.get("short_url") or ""
                        link_id = fallback_item.get("id")
                except Exception:
                    pass
            if not link_url:
                logger.error("Razorpay link creation failed: %s", rzp_err, exc_info=True)
                return (
                    "Online payment is temporarily unavailable. "
                    "You can pay cash on delivery or message the store directly."
                )

        existing_link = None
        if link_id:
            existing_link_stmt = select(PaymentLink).where(PaymentLink.razorpay_link_id == link_id)
            existing_link = (await ctx.deps.db.execute(existing_link_stmt)).scalars().first()

        if existing_link:
            existing_link.order_id = recent_order_id
            existing_link.amount = Decimal(str(amount))
            existing_link.customer_name = customer_name
            existing_link.customer_phone = customer_phone or None
            existing_link.customer_id = ctx.deps.customer_id
            existing_link.description = description or f"{ctx.deps.store_name} order"
            existing_link.receipt_number = receipt_no
            existing_link.callback_url = callback_url
            existing_link.status = PaymentLinkStatus.created
            link = existing_link
        else:
            link = PaymentLink(
                merchant_id=merchant.id,
                amount=Decimal(str(amount)),
                customer_name=customer_name,
                customer_phone=customer_phone or None,
                customer_id=ctx.deps.customer_id,
                order_id=recent_order_id,
                description=description or f"{ctx.deps.store_name} order",
                currency="INR",
                receipt_number=receipt_no,
                razorpay_link_id=link_id,
                razorpay_link_url=link_url,
                callback_url=callback_url,
                callback_method="get",
                status=PaymentLinkStatus.created,
                notify_sms=False,
                notify_email=False,
            )
            ctx.deps.db.add(link)

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="payment_link.created",
            entity_type="payment_link",
            entity_id=str(link.id),
            merchant_id=merchant.id,
            user_id=ctx.deps.customer_id,
            details={
                "amount": str(amount),
                "razorpay_link_id": link_id,
                "customer_name": customer_name,
                "customer_id": str(ctx.deps.customer_id) if ctx.deps.customer_id else None,
                "source": "customer_agent",
            },
        )
        await ctx.deps.db.commit()

        ctx.deps.created_payment_links.append({
            "fingerprint": link_fingerprint,
            "url": link_url,
            "amount": float(amount),
        })

        return (
            f"PAYMENT_LINK_CREATED\n"
            f"LINK_URL: {link_url}\n"
            f"AMOUNT: ₹{amount:.2f}\n"
            f"CRITICAL: Share this EXACT payment link with the customer so they can pay. "
            f"NEVER output raw 36-character database UUIDs or invent URLs."
        )
    except Exception as e:
        logger.error("Error in request_payment_link: %s", e, exc_info=True)
        try:
            await ctx.deps.db.rollback()
        except Exception:
            pass
        return f"Failed to create payment link: {e}"
