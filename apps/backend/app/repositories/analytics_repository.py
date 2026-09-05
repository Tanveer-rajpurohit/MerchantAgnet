import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderStatus
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.models.user import User


async def get_paid_payment_links(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    customer_filter: str | None = None,
) -> list[PaymentLink]:
    """Fetch all paid Razorpay payment links for a merchant within an optional time window."""
    stmt = select(PaymentLink).where(
        PaymentLink.merchant_id == merchant_id,
        PaymentLink.status == PaymentLinkStatus.paid,
    )
    if start_time is not None:
        stmt = stmt.where(
            func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) >= start_time
        )
    if end_time is not None:
        stmt = stmt.where(
            func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) <= end_time
        )
    if customer_filter:
        stmt = stmt.where(PaymentLink.customer_name.ilike(f"%{customer_filter}%"))

    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_paid_orders(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    customer_filter: str | None = None,
) -> list[Order]:
    """Fetch all paid or partially-paid store orders for a merchant within an optional time window."""
    stmt = (
        select(Order)
        .options(selectinload(Order.customer))
        .where(
            Order.merchant_id == merchant_id,
            or_(Order.status == OrderStatus.paid, Order.paid_amount > 0),
        )
    )
    if start_time is not None:
        stmt = stmt.where(
            func.coalesce(Order.updated_at, Order.created_at) >= start_time
        )
    if end_time is not None:
        stmt = stmt.where(
            func.coalesce(Order.updated_at, Order.created_at) <= end_time
        )
    if customer_filter:
        stmt = stmt.join(User, Order.customer_id == User.id).where(
            User.full_name.ilike(f"%{customer_filter}%")
        )

    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_unpaid_orders(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    customer_filter: str | None = None,
) -> list[Order]:
    """Fetch all unpaid store orders (udhaar) for a merchant."""
    stmt = (
        select(Order)
        .options(selectinload(Order.customer))
        .where(
            Order.merchant_id == merchant_id,
            Order.status == OrderStatus.unpaid,
        )
    )
    if customer_filter:
        stmt = stmt.join(User, Order.customer_id == User.id).where(
            User.full_name.ilike(f"%{customer_filter}%")
        )

    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_unpaid_standalone_links(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    customer_filter: str | None = None,
) -> list[PaymentLink]:
    """Fetch all standalone unpaid payment links (links not tied to an order)."""
    stmt = select(PaymentLink).where(
        PaymentLink.merchant_id == merchant_id,
        PaymentLink.status.in_([PaymentLinkStatus.created, PaymentLinkStatus.partially_paid]),
        PaymentLink.order_id.is_(None),
    )
    if customer_filter:
        stmt = stmt.where(PaymentLink.customer_name.ilike(f"%{customer_filter}%"))

    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_previous_day_collection(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    y_start: datetime,
    y_end: datetime,
) -> tuple[Decimal, Decimal, Decimal]:
    """Calculate the previous day's collection totals (order_revenue, link_revenue, total_collected)."""
    # 1. Paid payment links
    y_links_stmt = select(func.coalesce(func.sum(PaymentLink.amount), Decimal("0.00"))).where(
        PaymentLink.merchant_id == merchant_id,
        PaymentLink.status == PaymentLinkStatus.paid,
        func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) >= y_start,
        func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) <= y_end,
    )
    y_link_sum = (await db.execute(y_links_stmt)).scalar() or Decimal("0.00")

    # 2. Paid orders (excluding any tied to yesterday's payment links)
    y_linked_order_ids_stmt = select(PaymentLink.order_id).where(
        PaymentLink.merchant_id == merchant_id,
        PaymentLink.status == PaymentLinkStatus.paid,
        PaymentLink.order_id.is_not(None),
        func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) >= y_start,
        func.coalesce(PaymentLink.paid_at, PaymentLink.created_at) <= y_end,
    )
    y_linked_order_ids = set((await db.execute(y_linked_order_ids_stmt)).scalars().all())

    y_orders_stmt = select(Order).where(
        Order.merchant_id == merchant_id,
        or_(Order.status == OrderStatus.paid, Order.paid_amount > 0),
        func.coalesce(Order.updated_at, Order.created_at) >= y_start,
        func.coalesce(Order.updated_at, Order.created_at) <= y_end,
    )
    y_orders = (await db.execute(y_orders_stmt)).scalars().all()
    y_standalone_orders = [o for o in y_orders if o.id not in y_linked_order_ids]
    y_order_sum = sum(
        (o.paid_amount if o.paid_amount > 0 else o.total_amount for o in y_standalone_orders),
        Decimal("0.00"),
    )

    y_total = Decimal(str(y_link_sum)) + Decimal(str(y_order_sum))
    return Decimal(str(y_order_sum)), Decimal(str(y_link_sum)), y_total
