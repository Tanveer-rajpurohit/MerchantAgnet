from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.settlement import SettlementStatus
from app.schemas.settlement import (
    SettlementListResponse,
    PayoutsSummaryResponse,
)
from app.services import settlement_service
from app.repositories import settlement_repository

router = APIRouter(prefix="/payouts", tags=["Payouts & Settlements"])

@router.get("/summary", response_model=PayoutsSummaryResponse)
async def get_payouts_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    avail, settled, pending, count = await settlement_repository.get_summary_metrics(db, profile.id)
    return PayoutsSummaryResponse(
        available_balance=avail,
        total_settled=settled,
        pending_settlement=pending,
        settlement_count=count,
    )

@router.get("/settlements", response_model=SettlementListResponse)
async def list_settlements(
    page: int = Query(1, ge=1),
    count: int = Query(10, ge=1, le=100),
    status_filter: SettlementStatus | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    items, total_count, total_pages = await settlement_repository.list_by_merchant_paginated(
        db=db,
        merchant_id=profile.id,
        page=page,
        count=count,
        status=status_filter,
    )

    return SettlementListResponse(
        items=items,
        total_count=total_count,
        page=page,
        count=count,
        total_pages=total_pages,
    )

@router.post("/settlements/sync")
async def sync_settlements(
    count: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile or not profile.is_razorpay_active:
        raise HTTPException(status_code=400, detail="Razorpay integration not active")

    synced = await settlement_service.sync_settlements_from_razorpay(
        db=db,
        merchant=profile,
        user_id=current_user.id,
        count=count,
    )
    return {"status": "success", "synced_count": synced}
