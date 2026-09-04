import logging
import uuid
from decimal import Decimal
from pydantic_ai import RunContext
from sqlalchemy import select, or_

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.models.customer_connection import CustomerConnection
from app.models.user import User
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.repositories import audit_log_repository, payment_link_repository
from app.core.config import settings
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def create_payment_link(
    ctx: RunContext[MerchantAgentDeps],
    customer_name: str,
    amount: float,
    description: str,
    customer_phone: str | None = None,
    customer_email: str | None = None,
    customer_id: str | None = None,
) -> str:
    """Create a Razorpay payment link for a customer purchase or invoice.

    Call this when the merchant asks to create, send, or generate a payment link or bill for a customer.
    - customer_name: Name of the customer (e.g. 'Rajesh Kumar').
    - amount: Total amount in INR (e.g. 500.0).
    - description: Purpose or invoice summary (e.g. 'Order #123 payment' or '2x Wheat Flour').
    - customer_phone: Optional phone number (will receive WhatsApp / SMS if valid).
    - customer_email: Optional email address.
    Returns the generated payment link URL and details to share with the customer.
    """
    try:
        if (not customer_name or customer_name.strip() in ("", "Customer", "the customer")) and ctx.deps.target_customer_name:
            customer_name = ctx.deps.target_customer_name
        if not customer_phone and ctx.deps.target_customer_phone:
            customer_phone = ctx.deps.target_customer_phone

        norm_name = (customer_name or "").strip().lower()
        norm_amount = round(float(amount), 2)
        link_fingerprint = (norm_name, norm_amount)

        for prev in ctx.deps.created_payment_links:
            if prev.get("fingerprint") == link_fingerprint:
                logger.info("create_payment_link duplicate detected for %s ₹%.2f; returning cached link", customer_name, amount)
                return (
                    f"PAYMENT_LINK_ALREADY_CREATED\n"
                    f"LINK_URL: {prev['url']}\n"
                    f"AMOUNT: ₹{prev['amount']:.2f}\n"
                    f"STATUS: created\n"
                    f"NOTE: A payment link for {customer_name} (₹{norm_amount:.2f}) has ALREADY been generated in this turn. "
                    f"Share this existing LINK_URL instead of creating a duplicate."
                )

        merchant = ctx.deps.merchant
        if not merchant.is_razorpay_active:
            return (
                "Razorpay is not connected for this store. The merchant must connect "
                "a Razorpay test account in Settings before payment links can be created."
            )

        client = get_merchant_razorpay_client(merchant)

        amount_in_paise = int(round(float(amount) * 100))
        receipt_no = f"rcpt_{uuid.uuid4().hex[:8]}"
        callback_url = f"{settings.FRONTEND_URL}/payment-success"

        razorpay_payload: dict = {
            "amount": amount_in_paise,
            "currency": "INR",
            "accept_partial": False,
            "description": description,
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
        if customer_email:
            razorpay_payload["customer"]["email"] = customer_email

        try:
            razorpay_resp = client.payment_link.create(razorpay_payload)
        except Exception as rzp_err:
            logger.error("Razorpay link creation failed: %s", rzp_err, exc_info=True)
            return (
                f"Razorpay link creation failed: {str(rzp_err)}. "
                f"Tell the merchant to check their Razorpay keys in Settings."
            )

        resolved_customer_id: uuid.UUID | None = None
        if customer_id:
            try:
                resolved_customer_id = uuid.UUID(str(customer_id).strip())
            except (ValueError, TypeError):
                pass

        if not resolved_customer_id and ctx.deps.target_customer_id:
            resolved_customer_id = ctx.deps.target_customer_id

        if not resolved_customer_id and ctx.deps.target_customer_connection_id:
            conn = await ctx.deps.db.get(CustomerConnection, ctx.deps.target_customer_connection_id)
            if conn:
                resolved_customer_id = conn.customer_id

        if not resolved_customer_id and (customer_phone or customer_name or customer_email):
            stmt = (
                select(CustomerConnection)
                .join(User, CustomerConnection.customer_id == User.id)
                .where(CustomerConnection.merchant_id == merchant.id)
            )
            conditions = []
            if customer_phone:
                clean_p = "".join(filter(str.isdigit, customer_phone))[-10:]
                if len(clean_p) >= 10:
                    conditions.append(User.phone_number.contains(clean_p))
            if customer_email:
                conditions.append(User.email.ilike(customer_email.strip()))
            if customer_name and customer_name.strip().lower() not in ("", "customer", "the customer"):
                conditions.append(User.full_name.ilike(f"%{customer_name.strip()}%"))

            if conditions:
                stmt = stmt.where(or_(*conditions))
                res = await ctx.deps.db.execute(stmt)
                found_conn = res.scalars().first()
                if found_conn:
                    resolved_customer_id = found_conn.customer_id

        if not resolved_customer_id and (customer_phone or customer_email):
            u_conds = []
            if customer_phone:
                clean_p = "".join(filter(str.isdigit, customer_phone))[-10:]
                if len(clean_p) >= 10:
                    u_conds.append(User.phone_number.contains(clean_p))
            if customer_email:
                u_conds.append(User.email.ilike(customer_email.strip()))
            if u_conds:
                u_stmt = select(User).where(or_(*u_conds))
                u_res = await ctx.deps.db.execute(u_stmt)
                found_user = u_res.scalars().first()
                if found_user:
                    resolved_customer_id = found_user.id

        if not resolved_customer_id and getattr(ctx.deps.persona, "value", str(ctx.deps.persona)) == "customer_shopfront" and ctx.deps.user is not None:
            resolved_customer_id = ctx.deps.user.id

        link = PaymentLink(
            merchant_id=merchant.id,
            amount=Decimal(str(amount)),
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            customer_id=resolved_customer_id,
            description=description,
            currency="INR",
            receipt_number=receipt_no,
            razorpay_link_id=razorpay_resp.get("id"),
            razorpay_link_url=razorpay_resp.get("short_url"),
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
            user_id=_actor_user_id(ctx),
            details={
                "amount": str(amount),
                "razorpay_link_id": razorpay_resp.get("id"),
                "customer_name": customer_name,
                "customer_id": str(resolved_customer_id) if resolved_customer_id else None,
                "persona": ctx.deps.persona.value,
            },
        )
        await ctx.deps.db.commit()

        link_url = razorpay_resp.get("short_url") or "(no url returned)"
        ctx.deps.created_payment_links.append({
            "fingerprint": link_fingerprint,
            "url": link_url,
            "customer_name": customer_name,
            "link_id": razorpay_resp.get("id"),
            "internal_id": str(link.id),
            "amount": float(amount),
        })

        return (
            f"PAYMENT_LINK_CREATED\n"
            f"LINK_URL: {link_url}\n"
            f"AMOUNT: ₹{amount:.2f}\n"
            f"STATUS: created\n"
            f"Embed this LINK_URL in your message to the customer."
        )
    except Exception as e:
        logger.error("Error in create_payment_link: %s", e, exc_info=True)
        return f"Failed to create payment link: {str(e)}"


@merchant_agent.tool
async def check_payment_status(
    ctx: RunContext[MerchantAgentDeps],
    link_id: str,
) -> str:
    """Check the real-time status of a payment link (synced directly with Razorpay).

    Call this to verify if a customer has paid a link, check settlement status, or troubleshoot.
    - link_id: The Razorpay link ID (e.g. 'plink_xxx') or the internal link UUID.
    Returns the current status ('paid', 'created', 'partially_paid', 'expired'), amount, and payment timestamp.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)
        merchant = ctx.deps.merchant

        link: PaymentLink | None = None
        try:
            internal_id = uuid.UUID(str(link_id))
            link = await payment_link_repository.get_by_id(ctx.deps.db, internal_id, merchant_id)
        except (ValueError, TypeError):
            pass

        if link is None:
            link = await payment_link_repository.get_by_razorpay_link_id(ctx.deps.db, str(link_id))

        if link is None:
            return (
                f"Payment link '{link_id}' not found. Call list_payment_links to see all links."
            )

        if not merchant.is_razorpay_active or not link.razorpay_link_id:
            return _format_link_status(link, synced=False)

        try:
            client = get_merchant_razorpay_client(merchant)
            remote = client.payment_link.fetch(link.razorpay_link_id)
        except Exception as rzp_err:
            logger.warning("Razorpay fetch failed for %s: %s", link.razorpay_link_id, rzp_err)
            return _format_link_status(link, synced=False, error=str(rzp_err))

        remote_status = remote.get("status")
        status_map = {
            "created": PaymentLinkStatus.created,
            "partially_paid": PaymentLinkStatus.partially_paid,
            "paid": PaymentLinkStatus.paid,
            "cancelled": PaymentLinkStatus.cancelled,
            "expired": PaymentLinkStatus.expired,
        }
        new_status = status_map.get(remote_status, link.status)
        if new_status != link.status:
            link = await payment_link_repository.update_link_status(ctx.deps.db, link, new_status)
            if new_status == PaymentLinkStatus.paid and not link.razorpay_payment_id:
                payments = remote.get("payments")
                if payments and isinstance(payments, list) and len(payments) > 0:
                    first_p = payments[0]
                    if isinstance(first_p, dict) and first_p.get("payment_id"):
                        link.razorpay_payment_id = first_p.get("payment_id")
                    elif isinstance(first_p, str):
                        link.razorpay_payment_id = first_p
                elif remote.get("payment_id"):
                    link.razorpay_payment_id = remote.get("payment_id")
            await ctx.deps.db.commit()

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="payment_link.status_checked",
            entity_type="payment_link",
            entity_id=str(link.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={"status": link.status.value, "razorpay_status": remote_status},
        )
        await ctx.deps.db.commit()

        return _format_link_status(link, synced=True)
    except Exception as e:
        logger.error("Error in check_payment_status: %s", e, exc_info=True)
        return f"Failed to check payment status: {str(e)}"


def _format_link_status(link: PaymentLink, synced: bool, error: str | None = None) -> str:
    """Format a payment link's status for the agent response."""
    lines = [
        f"LINK_ID: {link.razorpay_link_id or '-'}",
        f"INTERNAL_ID: {link.id}",
        f"CUSTOMER: {link.customer_name}",
        f"AMOUNT: ₹{link.amount:.2f}",
        f"DESCRIPTION: {link.description}",
        f"STATUS: {link.status.value}",
    ]
    if link.status == PaymentLinkStatus.paid:
        lines.append(f"PAID_AT: {link.paid_at.isoformat() if link.paid_at else '-'}")
        lines.append(f"RAZORPAY_PAYMENT_ID: {link.razorpay_payment_id or '-'}")
    if link.razorpay_link_url:
        lines.append(f"URL: {link.razorpay_link_url}")
    if not synced:
        lines.append(f"SYNCED_WITH_RAZORPAY: no" + (f" ({error})" if error else " (showing local status only)"))
    else:
        lines.append("SYNCED_WITH_RAZORPAY: yes")
    return "\n".join(lines)


@merchant_agent.tool
async def list_payment_links(
    ctx: RunContext[MerchantAgentDeps],
    limit: int = 10,
) -> str:
    """List the merchant's most recent payment links (default 10). Includes status + amount + customer."""
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        cap = max(1, min(int(limit), 50))
        items, total_count, total_pages = await payment_link_repository.list_by_merchant_paginated(
            db=ctx.deps.db,
            merchant_id=_merchant_id(ctx),
            page=1,
            count=cap,
            status=None,
            search=None,
        )
        if not items:
            return "No payment links created yet."

        lines = ["INTERNAL_ID | RAZORPAY_ID | CUSTOMER | AMOUNT | STATUS | CREATED_AT"]
        for l in items:
            lines.append(
                f"{l.id} | {l.razorpay_link_id or '-'} | {l.customer_name} | "
                f"₹{l.amount:.2f} | {l.status.value} | {l.created_at.isoformat()}"
            )
        lines.append(f"\nTotal: {total_count} link(s). Use check_payment_status with INTERNAL_ID to verify any of them.")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in list_payment_links: %s", e, exc_info=True)
        return f"Error listing payment links: {str(e)}"
