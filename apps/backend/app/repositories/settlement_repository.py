import math
import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.settlement import Settlement, SettlementStatus
from app.models.payment_link import PaymentLink, PaymentLinkStatus

async def upsert_settlement(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    razorpay_settlement_id: str,
    amount: Decimal,
    fee: Decimal,
    tax: Decimal,
    net_amount: Decimal,
    currency: str = "INR",
    utr: str | None = None,
    method: str = "NEFT",
    status: SettlementStatus = SettlementStatus.processed,
    settled_at: datetime | None = None,
) -> Settlement:
    query = select(Settlement).where(
        Settlement.merchant_id == merchant_id,
        Settlement.razorpay_settlement_id == razorpay_settlement_id,
    )
    result = await db.execute(query)
    settlement = result.scalar_one_or_none()

    if settlement is None:
        settlement = Settlement(
            merchant_id=merchant_id,
            razorpay_settlement_id=razorpay_settlement_id,
            amount=amount,
            fee=fee,
            tax=tax,
            net_amount=net_amount,
            currency=currency,
            utr=utr,
            method=method,
            status=status,
            settled_at=settled_at,
        )
        db.add(settlement)
    else:
        settlement.amount = amount
        settlement.fee = fee
        settlement.tax = tax
        settlement.net_amount = net_amount
        settlement.utr = utr or settlement.utr
        settlement.status = status
        if settled_at:
            settlement.settled_at = settled_at
        
    await db.flush()
    return settlement

async def list_by_merchant_paginated(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    page: int = 1,
    count: int = 10,
    status: SettlementStatus | None = None,
) -> tuple[list[Settlement], int, int]:
    base_query = select(Settlement).where(Settlement.merchant_id == merchant_id)

    if status is not None:
        base_query = base_query.where(Settlement.status == status)

    count_query = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_query)).scalar_one() or 0

    total_pages = math.ceil(total_count / count) if total_count > 0 else 1
    offset_val = (page - 1) * count

    query = base_query.order_by(Settlement.created_at.desc()).offset(offset_val).limit(count)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total_count, total_pages

async def get_summary_metrics(
    db: AsyncSession,
    merchant_id: uuid.UUID,
) -> tuple[Decimal, Decimal, Decimal, int]:
    # Lifetime settled net amoun
    settled_query = select(
        func.coalesce(func.sum(Settlement.net_amount), 0),
        func.count(Settlement.id),
    ).where(
        Settlement.merchant_id == merchant_id,
        Settlement.status == SettlementStatus.processed,
    )
    settled_res = await db.execute(settled_query)
    total_settled, settlement_count = settled_res.one()

    # Pending settlements
    pending_query = select(
        func.coalesce(func.sum(Settlement.net_amount), 0),
    ).where(
        Settlement.merchant_id == merchant_id,
        Settlement.status == SettlementStatus.pending,
    )
    pending_res = await db.execute(pending_query)
    pending_settlement = pending_res.scalar_one() or Decimal("0.00")

    # Available balance: Paid links amount minus settled amount
    paid_links_query = select(
        func.coalesce(func.sum(PaymentLink.amount), 0),
    ).where(
        PaymentLink.merchant_id == merchant_id,
        PaymentLink.status == PaymentLinkStatus.paid,
    )
    paid_links_res = await db.execute(paid_links_query)
    total_paid_links = paid_links_res.scalar_one() or Decimal("0.00")

    available_balance = max(Decimal("0.00"), total_paid_links - Decimal(str(total_settled)))

    return Decimal(str(available_balance)), Decimal(str(total_settled)), Decimal(str(pending_settlement)), int(settlement_count)

