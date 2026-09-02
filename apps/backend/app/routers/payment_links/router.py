import uuid
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.payment_link import PaymentLinkStatus
from app.schemas.payment_link import (
    PaymentLinkCreateRequest,
    PaymentLinkVerifyRequest,
    PaymentLinkResponse,
    PaymentLinkListResponse,
)
from app.services import payment_link_service
from app.repositories import payment_link_repository

router = APIRouter(prefix="/payment-links", tags=["Payment Links"])

@router.post("", response_model=PaymentLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_link(
    payload: PaymentLinkCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile or not profile.is_razorpay_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Razorpay is not active on this merchant workspace",
        )

    link = await payment_link_service.create_payment_link(
        db=db,
        merchant=profile,
        payload=payload,
        user_id=current_user.id,
    )
    await db.commit()
    return link


@router.get("", response_model=PaymentLinkListResponse)
async def list_payment_links(
    page: int = Query(1, ge=1),
    count: int = Query(10, ge=1, le=100),
    status_filter: PaymentLinkStatus | None = Query(None, alias="status"),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    items, total_count, total_pages = await payment_link_repository.list_by_merchant_paginated(
        db=db,
        merchant_id=profile.id,
        page=page,
        count=count,
        status=status_filter,
        search=search,
    )

    return PaymentLinkListResponse(
        items=items,
        total_count=total_count,
        page=page,
        count=count,
        total_pages=total_pages,
    )

@router.get("/{link_id}", response_model=PaymentLinkResponse)
async def get_payment_link(
    link_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    link = await payment_link_repository.get_by_id(db, link_id, profile.id)
    if not link:
        raise HTTPException(status_code=404, detail="Payment link not found")
    return link

@router.post("/verify-payment", response_model=PaymentLinkResponse)
async def verify_payment(
    payload: PaymentLinkVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    return await payment_link_service.verify_payment_callback(db=db, payload=payload)

@router.post("/{link_id}/sync", response_model=PaymentLinkResponse)
async def sync_payment_link(
    link_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile or not profile.is_razorpay_active:
        raise HTTPException(status_code=400, detail="Razorpay is not active")

    return await payment_link_service.sync_link_status(db, profile, link_id)