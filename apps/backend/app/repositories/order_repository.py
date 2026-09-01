import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatusHistory, OrderStatus, ActorType
from app.schemas.order import OrderItemCreate

def order_eager_options():
    return [
        selectinload(Order.items),
        selectinload(Order.customer),
        selectinload(Order.merchant_profile),
        selectinload(Order.status_history),
    ]

async def get_by_id(
    db: AsyncSession,
    order_id: uuid.UUID | str,
    merchant_id: uuid.UUID | str | None = None,
    customer_id: uuid.UUID | str | None = None,
) -> Order | None:
    o_id = uuid.UUID(str(order_id)) if isinstance(order_id, str) else order_id
    query = select(Order).options(*order_eager_options()).where(Order.id == o_id)

    if merchant_id is not None:
        m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
        query = query.where(Order.merchant_id == m_id)

    if customer_id is not None:
        c_id = uuid.UUID(str(customer_id)) if isinstance(customer_id, str) else customer_id
        query = query.where(Order.customer_id == c_id)

    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_by_merchant(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
    status: OrderStatus | None = None,
    customer_id: uuid.UUID | str | None = None,
    search: str | None = None,
    cursor: datetime | None = None,
    limit: int = 30,
) -> list[Order]:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = (
        select(Order)
        .options(*order_eager_options())
        .join(User, Order.customer_id == User.id)
        .where(Order.merchant_id == m_id)
    )

    if status is not None:
        query = query.where(Order.status == status)

    if customer_id is not None:
        c_id = uuid.UUID(str(customer_id)) if isinstance(customer_id, str) else customer_id
        query = query.where(Order.customer_id == c_id)

    if search and search.strip():
        term = search.strip()
        like_term = f"%{term}%"
        query = query.where(
            or_(
                User.full_name.ilike(like_term),
                User.phone_number.ilike(like_term),
                User.email.ilike(like_term),
                Order.items.any(OrderItem.product_name_snapshot.ilike(like_term)),
            )
        )

    if cursor is not None:
        query = query.where(Order.created_at < cursor)

    query = query.order_by(Order.created_at.desc()).limit(limit + 1)
    result = await db.execute(query)
    return list(result.scalars().all())

async def list_by_customer(
    db: AsyncSession,
    customer_id: uuid.UUID | str,
    status: OrderStatus | None = None,
    cursor: datetime | None = None,
    limit: int = 30,
) -> list[Order]:
    c_id = uuid.UUID(str(customer_id)) if isinstance(customer_id, str) else customer_id
    query = select(Order).options(*order_eager_options()).where(Order.customer_id == c_id)

    if status is not None:
        query = query.where(Order.status == status)

    if cursor is not None:
        query = query.where(Order.created_at < cursor)

    query = query.order_by(Order.created_at.desc()).limit(limit + 1)
    result = await db.execute(query)
    return list(result.scalars().all())

async def create_order(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    customer_id: uuid.UUID,
    customer_connection_id: uuid.UUID | None,
    items: list[OrderItemCreate],
    total_amount: Decimal,
    paid_amount: Decimal,
    status: OrderStatus,
    changed_by: ActorType,
    reason: str | None = None,
) -> Order:
    order = Order(
        merchant_id=merchant_id,
        customer_id=customer_id,
        customer_connection_id=customer_connection_id,
        total_amount=total_amount,
        paid_amount=paid_amount,
        status=status,
    )
    db.add(order)
    await db.flush()

    for item_data in items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            product_name_snapshot=item_data.product_name_snapshot.strip(),
            quantity=item_data.quantity,
            unit_price_snapshot=item_data.unit_price_snapshot,
        )
        db.add(order_item)

    history = OrderStatusHistory(
        order_id=order.id,
        previous_status=None,
        new_status=status,
        changed_by=changed_by,
        reason=reason or "Initial order creation",
    )
    db.add(history)

    await db.flush()
    await db.refresh(order)

    loaded = await get_by_id(db, order.id)
    return loaded if loaded is not None else order

async def update_order(
    db: AsyncSession,
    order: Order,
    new_status: OrderStatus | None = None,
    paid_amount: Decimal | None = None,
    changed_by: ActorType = ActorType.merchant,
    reason: str | None = None,
) -> Order:
    if new_status is not None and new_status != order.status:
        history = OrderStatusHistory(
            order_id=order.id,
            previous_status=order.status,
            new_status=new_status,
            changed_by=changed_by,
            reason=reason,
        )
        db.add(history)
        order.status = new_status

    if paid_amount is not None:
        order.paid_amount = paid_amount

    await db.flush()
    await db.refresh(order)

    loaded = await get_by_id(db, order.id)
    return loaded if loaded is not None else order
