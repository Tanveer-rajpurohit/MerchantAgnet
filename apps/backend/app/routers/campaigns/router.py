import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_merchant
from app.models.user import User
from app.models.campaign import CampaignStatus
from app.services import campaign_service
from app.schemas.campaign import (
    CampaignListResponse,
    CampaignResponse,
    CampaignApproveResult,
    CampaignDeclineResult,
)

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.get("", response_model=CampaignListResponse)
async def list_campaigns(
    status_filter: CampaignStatus | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchant profile not found")
    return await campaign_service.list_campaigns(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        status_filter=status_filter,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchant profile not found")
    return await campaign_service.get_campaign(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        campaign_id=campaign_id,
    )


@router.post("/{campaign_id}/approve", response_model=CampaignApproveResult)
async def approve_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchant profile not found")
    return await campaign_service.approve_and_send(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        campaign_id=campaign_id,
        approver_user_id=current_user.id,
    )


@router.post("/{campaign_id}/decline", response_model=CampaignDeclineResult)
async def decline_campaign(
    campaign_id: uuid.UUID,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Merchant profile not found")
    return await campaign_service.decline(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        campaign_id=campaign_id,
        decliner_user_id=current_user.id,
    )
