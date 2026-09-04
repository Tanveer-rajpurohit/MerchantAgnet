import math
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.models.user import User

async def create_payment_link(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    amount: Decimal,
    customer_name: str,
    description: str,
    currency: str = "INR",
    customer_phone: str | None = None,
    customer_email: str | None = None,
    customer_id: uuid.UUID | None = None,
    order_id: uuid.UUID | None = None,
    receipt_number: str | None = None,
    razorpay_link_id: str | None = None,
    razorpay_link_url: str | None = None,
    callback_url: str | None = None,
    callback_method: str = "get",
    notify_sms: bool = False,
    notify_email: bool = False,
) -> PaymentLink:
    link = PaymentLink(
        merchant_id=merchant_id,
        amount=amount,
        customer_name=customer_name,
        description=description,
        currency=currency,
        customer_phone=customer_phone,
        customer_email=customer_email,
        customer_id=customer_id,
        order_id=order_id,
        receipt_number=receipt_number,
        razorpay_link_id=razorpay_link_id,
        razorpay_link_url=razorpay_link_url,
        callback_url=callback_url,
        callback_method=callback_method,
        status=PaymentLinkStatus.created,
        notify_sms=notify_sms,
        notify_email=notify_email,
    )

    db.add(link)
    await db.flush()
    return link

async def get_by_id(
    db: AsyncSession,
    link_id: uuid.UUID,
    merchant_id: uuid.UUID | None = None,
) -> PaymentLink | None:
    query = (
        select(PaymentLink)
        .options(selectinload(PaymentLink.merchant))
        .where(PaymentLink.id == link_id)
    )
    if merchant_id is not None:
        query = query.where(PaymentLink.merchant_id == merchant_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_by_razorpay_link_id(
    db: AsyncSession,
    razorpay_link_id: str,
) -> PaymentLink | None:
    query = (
        select(PaymentLink)
        .options(selectinload(PaymentLink.merchant))
        .where(PaymentLink.razorpay_link_id == razorpay_link_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_by_merchant_paginated(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    page: int = 1,
    count: int = 10,
    status: PaymentLinkStatus | None = None,
    search: str | None = None,
) -> tuple[list[PaymentLink], int, int]:
    base_query = select(PaymentLink).where(PaymentLink.merchant_id == merchant_id)

    if status is not None:
        base_query = base_query.where(PaymentLink.status == status)
    
    if search:
        search_term = f"%{search.strip()}%"
        base_query = base_query.where(
            or_(
                PaymentLink.customer_name.ilike(search_term),
                PaymentLink.customer_phone.ilike(search_term),
                PaymentLink.description.ilike(search_term),
                PaymentLink.razorpay_link_id.ilike(search_term),
            )
        )
    
    count_query = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_query)).scalar_one() or 0

    total_pages = math.ceil(total_count / count) if total_count > 0 else 1
    offset_val = (page - 1) * count

    query = base_query.order_by(PaymentLink.created_at.desc()).offset(offset_val).limit(count)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total_count, total_pages

async def mark_as_paid(
    db: AsyncSession,
    payment_link: PaymentLink,
    razorpay_payment_id: str,
    razorpay_signature: str,
    payment_method: str | None = None,
) -> PaymentLink:
    payment_link.status = PaymentLinkStatus.paid
    payment_link.paid_at = datetime.now(timezone.utc)
    payment_link.razorpay_payment_id = razorpay_payment_id
    payment_link.razorpay_signature = razorpay_signature
    if payment_method:
        payment_link.payment_method = payment_method
    await db.flush()
    return payment_link

async def update_link_status(
    db: AsyncSession,
    payment_link: PaymentLink,
    new_status: PaymentLinkStatus,
) -> PaymentLink:
    payment_link.status = new_status
    if new_status == PaymentLinkStatus.paid and not payment_link.paid_at:
        payment_link.paid_at = datetime.now(timezone.utc)
    elif new_status == PaymentLinkStatus.cancelled:
        payment_link.cancelled_at = datetime.now(timezone.utc)
    elif new_status == PaymentLinkStatus.expired:
        payment_link.expired_at = datetime.now(timezone.utc)
    await db.flush()
    return payment_link


async def list_by_customer(
    db: AsyncSession,
    customer_id: uuid.UUID,
    status: PaymentLinkStatus | None = None,
    limit: int = 50,
) -> list[PaymentLink]:
    """Return payment links generated for a specific customer (most recent first).

    Used by the customer-side "My Payment Links" page so the customer can see
    and pay outstanding links generated for them by any merchant.
    Matches by customer_id or phone/email fallback, and backfills customer_id.
    """
    user_res = await db.execute(select(User).where(User.id == customer_id))
    user = user_res.scalar_one_or_none()

    clauses = [PaymentLink.customer_id == customer_id]
    if user:
        if user.phone_number:
            raw_phone = user.phone_number.strip()
            ten_digit = raw_phone[-10:] if len(raw_phone) >= 10 else raw_phone
            clauses.append(PaymentLink.customer_phone == raw_phone)
            if ten_digit != raw_phone:
                clauses.append(PaymentLink.customer_phone == ten_digit)
                clauses.append(PaymentLink.customer_phone.like(f"%{ten_digit}"))
        if user.email:
            clauses.append(func.lower(PaymentLink.customer_email) == user.email.strip().lower())

    query = select(PaymentLink).where(or_(*clauses))
    if status is not None:
        query = query.where(PaymentLink.status == status)
    query = query.order_by(PaymentLink.created_at.desc()).limit(limit)
    result = await db.execute(query)
    links = list(result.scalars().all())

    modified = False
    for link in links:
        if link.customer_id is None:
            link.customer_id = customer_id
            modified = True
    if modified:
        await db.flush()

    return links
