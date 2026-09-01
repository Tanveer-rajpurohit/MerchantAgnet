import uuid
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus, ActorType
from app.repositories import order_repository, customer_connection_repository
from app.schemas.order import (
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderResponse,
    OrderItemResponse,
    OrderStatusHistoryResponse,
    PaginatedOrderResponse,
)

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

    if current_user is not None and current_user.role == UserRole.customer:
        target_customer_id = current_user.id

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
        paid_amount=payload.paid_amount,
        status=payload.status,
        changed_by=changed_by,
        reason="Order created",
    )

    if payload.paid_amount > Decimal("0.00") and connection_id is not None:
        conn = await customer_connection_repository.get_by_id(db, connection_id)
        if conn:
            conn.total_spent = (conn.total_spent or Decimal("0.00")) + payload.paid_amount
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
    updated_order = await order_repository.update_order(
        db=db,
        order=order,
        new_status=payload.status,
        paid_amount=payload.paid_amount,
        changed_by=actor,
        reason=payload.reason or "Order updated",
    )

    if payload.paid_amount is not None and updated_order.customer_connection_id:
        difference = payload.paid_amount - previous_paid
        if difference != Decimal("0.00"):
            conn = await customer_connection_repository.get_by_id(db, updated_order.customer_connection_id)
            if conn:
                conn.total_spent = (conn.total_spent or Decimal("0.00")) + difference
                await db.flush()

    return to_order_response(updated_order)
