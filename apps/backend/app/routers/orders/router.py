import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user, get_current_merchant
from app.models.user import User, UserRole
from app.models.order import OrderStatus, ActorType
from app.services import order_service
from app.schemas.order import (
    OrderCreateRequest,
    OrderUpdateRequest,
    OrderResponse,
    PaginatedOrderResponse,
    OrderWhatsAppMessageRequest,
    OrderWhatsAppMessageResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get(
    "",
    response_model=PaginatedOrderResponse,
)
async def list_merchant_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    customer_id: uuid.UUID | None = Query(None),
    search: str | None = Query(None),
    cursor: datetime | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not found",
        )
    return await order_service.list_merchant_orders(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        status_filter=status_filter,
        customer_id=customer_id,
        search=search,
        cursor=cursor,
        limit=limit,
    )

@router.get(
    "/my-orders",
    response_model=PaginatedOrderResponse,
)
async def list_my_orders(
    status_filter: OrderStatus | None = Query(None, alias="status"),
    cursor: datetime | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await order_service.list_customer_orders(
        db=db,
        customer_id=current_user.id,
        status_filter=status_filter,
        cursor=cursor,
        limit=limit,
    )

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    merchant_id = current_user.merchant_profile.id if current_user.merchant_profile else None
    customer_id = current_user.id if current_user.role == UserRole.customer else None

    return await order_service.get_order_by_id(
        db=db,
        order_id=order_id,
        merchant_id=merchant_id,
        customer_id=customer_id,
    )

@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: OrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await order_service.create_order(
        db=db,
        payload=payload,
        current_user=current_user,
    )

@router.put(
    "/{order_id}",
    response_model=OrderResponse,
)
@router.patch(
    "/{order_id}",
    response_model=OrderResponse,
)
async def update_order(
    order_id: uuid.UUID,
    payload: OrderUpdateRequest,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not found",
        )

    return await order_service.update_order(
        db=db,
        order_id=order_id,
        merchant_id=current_user.merchant_profile.id,
        customer_id=None,
        payload=payload,
        actor=ActorType.merchant,
    )


@router.post(
    "/{order_id}/whatsapp-message",
    response_model=OrderWhatsAppMessageResponse,
)
async def generate_order_whatsapp_message(
    order_id: uuid.UUID,
    payload: OrderWhatsAppMessageRequest | None = None,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not found",
        )

    mode = payload.mode if payload else "both"
    return await order_service.generate_order_whatsapp_message(
        db=db,
        order_id=order_id,
        merchant_id=current_user.merchant_profile.id,
        mode=mode,
    )

