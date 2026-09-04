import uuid
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus, ActorType
from app.models.product import Product
import logging
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.repositories import (
    order_repository,
    customer_connection_repository,
    product_repository,
    payment_link_repository,
)
from app.schemas.order import (
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderResponse,
    OrderItemResponse,
    OrderStatusHistoryResponse,
    PaginatedOrderResponse,
    OrderWhatsAppMessageResponse,
)

logger = logging.getLogger(__name__)

def to_order_response(order: Order) -> OrderResponse:
    customer = order.customer
    merchant = order.merchant_profile
    return OrderResponse(
        id=order.id,
        merchant_id=order.merchant_id,
        store_name=merchant.business_name if merchant else "Unknown Store",
        customer_id=order.customer_id,
        customer_connection_id=order.customer_connection_id,
        customer_name=customer.full_name if customer else "Unknown Customer",
        customer_phone=customer.phone_number if customer else None,
        customer_email=customer.email if customer else "",
        total_amount=order.total_amount,
        paid_amount=order.paid_amount,
        status=order.status,
        items=[OrderItemResponse.model_validate(it) for it in order.items],
        status_history=[OrderStatusHistoryResponse.model_validate(h) for h in order.status_history],
        created_at=order.created_at,
        updated_at=order.updated_at,
    )

async def create_order(
    db: AsyncSession,
    payload: OrderCreateRequest,
    current_user: User | None = None,
) -> OrderResponse:
    merchant_id = payload.merchant_id
    changed_by = payload.created_by

    if current_user is not None:
        if current_user.role == UserRole.merchant and current_user.merchant_profile:
            if merchant_id is None:
                merchant_id = current_user.merchant_profile.id
            if changed_by not in (ActorType.merchant, ActorType.ai_agent, ActorType.system):
                changed_by = ActorType.merchant
        elif current_user.role == UserRole.customer:
            changed_by = ActorType.customer

    if merchant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="merchant_id is required",
        )

    target_customer_id = payload.customer_id
    connection_id = payload.customer_connection_id
    status_to_set = payload.status
    paid_amount_to_set = payload.paid_amount

    if current_user is not None and current_user.role == UserRole.customer:
        target_customer_id = current_user.id
        status_to_set = OrderStatus.unpaid
        paid_amount_to_set = Decimal("0.00")

        for item in payload.items:
            product = None
            if item.product_id:
                product = await product_repository.get_by_id(db, item.product_id, merchant_id)
            if not product and item.product_name_snapshot:
                stmt = (
                    select(Product)
                    .where(
                        Product.merchant_id == merchant_id,
                        Product.is_active.is_(True),
                        Product.product_name.ilike(item.product_name_snapshot.strip()),
                    )
                    .limit(1)
                )
                product = (await db.execute(stmt)).scalars().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{item.product_name_snapshot}' is not available in this store.",
                )
            item.unit_price_snapshot = product.selling_price
            item.product_id = product.id
            item.product_name_snapshot = product.product_name

    if connection_id is not None:
        conn = await customer_connection_repository.get_by_id(db, connection_id, merchant_id)
        if not conn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer connection not found",
            )
        target_customer_id = conn.customer_id
    elif target_customer_id is not None:
        conn = await customer_connection_repository.get_or_create_connection(
            db=db,
            merchant_id=merchant_id,
            customer_id=target_customer_id,
        )
        connection_id = conn.id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either customer_id or customer_connection_id is required",
        )

    total_amount = sum(
        (item.quantity * item.unit_price_snapshot for item in payload.items),
        Decimal("0.00"),
    )

    order = await order_repository.create_order(
        db=db,
        merchant_id=merchant_id,
        customer_id=target_customer_id,
        customer_connection_id=connection_id,
        items=payload.items,
        total_amount=total_amount,
        paid_amount=paid_amount_to_set,
        status=status_to_set,
        changed_by=changed_by,
        reason="Order created",
    )

    if paid_amount_to_set > Decimal("0.00") and connection_id is not None:
        conn = await customer_connection_repository.get_by_id(db, connection_id)
        if conn:
            conn.total_spent = (conn.total_spent or Decimal("0.00")) + paid_amount_to_set
            await db.flush()

    return to_order_response(order)

async def list_merchant_orders(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    status_filter: OrderStatus | None = None,
    customer_id: uuid.UUID | None = None,
    search: str | None = None,
    cursor: datetime | None = None,
    limit: int = 30,
) -> PaginatedOrderResponse:
    orders = await order_repository.list_by_merchant(
        db=db,
        merchant_id=merchant_id,
        status=status_filter,
        customer_id=customer_id,
        search=search,
        cursor=cursor,
        limit=limit,
    )
    has_more = len(orders) > limit
    items = orders[:limit]
    next_cursor = items[-1].created_at if has_more and items else None

    return PaginatedOrderResponse(
        items=[to_order_response(o) for o in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )

async def list_customer_orders(
    db: AsyncSession,
    customer_id: uuid.UUID,
    status_filter: OrderStatus | None = None,
    cursor: datetime | None = None,
    limit: int = 30,
) -> PaginatedOrderResponse:
    orders = await order_repository.list_by_customer(
        db=db,
        customer_id=customer_id,
        status=status_filter,
        cursor=cursor,
        limit=limit,
    )
    has_more = len(orders) > limit
    items = orders[:limit]
    next_cursor = items[-1].created_at if has_more and items else None

    return PaginatedOrderResponse(
        items=[to_order_response(o) for o in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )

async def get_order_by_id(
    db: AsyncSession,
    order_id: uuid.UUID,
    merchant_id: uuid.UUID | None = None,
    customer_id: uuid.UUID | None = None,
) -> OrderResponse:
    order = await order_repository.get_by_id(
        db=db,
        order_id=order_id,
        merchant_id=merchant_id,
        customer_id=customer_id,
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return to_order_response(order)

async def update_order(
    db: AsyncSession,
    order_id: uuid.UUID,
    merchant_id: uuid.UUID | None,
    customer_id: uuid.UUID | None,
    payload: OrderUpdateRequest,
    actor: ActorType,
) -> OrderResponse:
    order = await order_repository.get_by_id(
        db=db,
        order_id=order_id,
        merchant_id=merchant_id,
        customer_id=customer_id,
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    previous_paid = order.paid_amount
    new_status = payload.status
    paid_amount = payload.paid_amount
    items = payload.items

    new_total = order.total_amount
    if items is not None and len(items) > 0:
        new_total = sum(
            Decimal(str(it.quantity)) * Decimal(str(it.unit_price_snapshot))
            for it in items
        )

    if new_status == OrderStatus.paid and paid_amount is None:
        paid_amount = new_total
    elif new_status == OrderStatus.unpaid and paid_amount is None:
        paid_amount = Decimal("0.00")

    updated_order = await order_repository.update_order(
        db=db,
        order=order,
        new_status=new_status,
        paid_amount=paid_amount,
        items=items,
        changed_by=actor,
        reason=payload.reason or "Order updated",
    )

    if paid_amount is not None and updated_order.customer_connection_id:
        difference = paid_amount - previous_paid
        if difference != Decimal("0.00"):
            conn = await customer_connection_repository.get_by_id(db, updated_order.customer_connection_id)
            if conn:
                conn.total_spent = (conn.total_spent or Decimal("0.00")) + difference
                await db.flush()

    await db.commit()
    return to_order_response(updated_order)


async def generate_order_whatsapp_message(
    db: AsyncSession,
    order_id: uuid.UUID,
    merchant_id: uuid.UUID,
    mode: str = "both",
) -> OrderWhatsAppMessageResponse:
    order = await order_repository.get_by_id(
        db=db,
        order_id=order_id,
        merchant_id=merchant_id,
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    total_amount = float(order.total_amount or 0)
    paid_amount = float(order.paid_amount or 0)
    due_amount = max(0.0, round(total_amount - paid_amount, 2))

    is_reminder_only = mode in ("reminder", "reminder_only", "no_link")
    payment_link_url = ""

    if not is_reminder_only and due_amount > 0:
        pl_stmt = (
            select(PaymentLink)
            .where(
                PaymentLink.order_id == order.id,
                PaymentLink.status.in_([PaymentLinkStatus.created, PaymentLinkStatus.partially_paid]),
            )
            .order_by(PaymentLink.created_at.desc())
        )
        pl_res = await db.execute(pl_stmt)
        existing_link = pl_res.scalars().first()

        if not existing_link and order.customer_id:
            cust_pl_stmt = (
                select(PaymentLink)
                .where(
                    PaymentLink.merchant_id == order.merchant_id,
                    PaymentLink.customer_id == order.customer_id,
                    PaymentLink.status.in_([PaymentLinkStatus.created, PaymentLinkStatus.partially_paid]),
                    PaymentLink.amount == Decimal(str(due_amount)),
                )
                .order_by(PaymentLink.created_at.desc())
            )
            cust_pl_res = await db.execute(cust_pl_stmt)
            existing_link = cust_pl_res.scalars().first()
            if existing_link and not existing_link.order_id:
                existing_link.order_id = order.id
                await db.commit()

        if existing_link and existing_link.razorpay_link_url:
            payment_link_url = existing_link.razorpay_link_url

        merchant = order.merchant_profile
        if not payment_link_url and merchant and merchant.is_razorpay_active:
            try:
                client = get_merchant_razorpay_client(merchant)
                amount_in_paise = int(round(due_amount * 100))
                receipt_no = f"rcpt_{uuid.uuid4().hex[:8]}"
                callback_url = f"{settings.FRONTEND_URL}/payment-success"
                cust_name = order.customer.full_name if order.customer else "Customer"
                clean_phone = "".join(filter(str.isdigit, order.customer.phone_number or "")) if order.customer else ""

                razorpay_payload = {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "accept_partial": False,
                    "description": f"Order #{str(order.id)[:8]} payment",
                    "customer": {"name": cust_name},
                    "notify": {"sms": False, "email": False},
                    "reminder_enable": True,
                    "callback_url": callback_url,
                    "callback_method": "get",
                }
                if len(clean_phone) >= 10:
                    razorpay_payload["customer"]["contact"] = f"+91{clean_phone[-10:]}"
                if order.customer and order.customer.email:
                    razorpay_payload["customer"]["email"] = order.customer.email

                razorpay_resp = client.payment_link.create(razorpay_payload)
                rzp_url = razorpay_resp.get("short_url") or razorpay_resp.get("url")
                if rzp_url:
                    await payment_link_repository.create_payment_link(
                        db=db,
                        merchant_id=merchant.id,
                        amount=Decimal(str(due_amount)),
                        currency="INR",
                        customer_name=cust_name,
                        description=f"Order #{str(order.id)[:8]} payment",
                        customer_phone=clean_phone if clean_phone else None,
                        customer_email=order.customer.email if order.customer else None,
                        customer_id=order.customer_id,
                        order_id=order.id,
                        receipt_number=receipt_no,
                        razorpay_link_id=razorpay_resp.get("id"),
                        razorpay_link_url=rzp_url,
                        callback_url=callback_url,
                        callback_method="get",
                        notify_sms=False,
                        notify_email=False,
                    )
                    payment_link_url = rzp_url
                    await db.commit()
            except Exception as link_err:
                logger.warning("Failed to create Razorpay link for order %s: %s", order.id, link_err)

        if not payment_link_url and merchant and merchant.upi_vpa:
            payment_link_url = f"upi://pay?pa={merchant.upi_vpa}&pn={merchant.business_name or 'Store'}&am={due_amount:.2f}&cu=INR"

    store_name = (order.merchant_profile.business_name if order.merchant_profile else "") or "Our Store"
    cust_name = (order.customer.full_name if order.customer else "") or "Valued Customer"
    order_short_id = str(order.id)[:8]

    items_lines = []
    for it in order.items:
        qty = it.quantity
        uprice = float(it.unit_price_snapshot)
        subtotal = qty * uprice
        items_lines.append(f"• {it.product_name_snapshot} × {qty} — ₹{subtotal:,.2f}")
    items_text = "\n".join(items_lines) if items_lines else "• Order items"

    paid_line = f"✅ *Paid Amount:* ₹{paid_amount:,.2f}\n" if paid_amount > 0 else ""

    if is_reminder_only:
        message_text = (
            f"Namaste {cust_name} ji! 🙏\n\n"
            f"This is a gentle payment reminder from *{store_name}* for your order #{order_short_id}.\n\n"
            f"📦 *Items Ordered:*\n{items_text}\n\n"
            f"💵 *Total Bill:* ₹{total_amount:,.2f}\n"
            f"{paid_line}"
            f"⏳ *Balance Due:* ₹{due_amount:,.2f}\n\n"
            f"Kindly arrange the payment at your earliest convenience. Thank you for shopping with us!"
        )
    else:
        pay_str = f"\n\n💳 *Pay online securely via Razorpay:*\n{payment_link_url}" if payment_link_url else ""
        message_text = (
            f"Namaste {cust_name} ji! 🙏\n\n"
            f"Here is your order summary from *{store_name}* (Order #{order_short_id}):\n\n"
            f"📦 *Items:*\n{items_text}\n\n"
            f"💵 *Total Bill:* ₹{total_amount:,.2f}\n"
            f"{paid_line}"
            f"⏳ *Balance Due:* ₹{due_amount:,.2f}"
            f"{pay_str}\n\n"
            f"Thank you for your business!"
        )

    return OrderWhatsAppMessageResponse(
        message=message_text,
        payment_link=payment_link_url,
        due_amount=due_amount,
    )
