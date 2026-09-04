import uuid
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign, CampaignTarget, CampaignStatus
from app.models.customer_connection import CustomerConnection
from app.models.conversation import SendStatus


def _campaign_eager_options():
    return [
        selectinload(Campaign.targets).selectinload(
            CampaignTarget.customer_connection
        ).selectinload(CustomerConnection.customer),
    ]


async def list_by_merchant(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    status_filter: CampaignStatus | None = None,
) -> list[Campaign]:
    stmt = select(Campaign).where(Campaign.merchant_id == merchant_id)
    if status_filter is not None:
        stmt = stmt.where(Campaign.status == status_filter)
    stmt = stmt.order_by(Campaign.created_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_by_id(
    db: AsyncSession,
    campaign_id: uuid.UUID,
    merchant_id: uuid.UUID,
) -> Campaign | None:
    stmt = (
        select(Campaign)
        .options(*_campaign_eager_options())
        .where(Campaign.id == campaign_id, Campaign.merchant_id == merchant_id)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def count_targets(db: AsyncSession, campaign_id: uuid.UUID) -> int:
    stmt = select(func.count()).select_from(
        select(CampaignTarget).where(CampaignTarget.campaign_id == campaign_id).subquery()
    )
    return (await db.execute(stmt)).scalar_one() or 0


async def mark_status(
    db: AsyncSession,
    campaign: Campaign,
    new_status: CampaignStatus,
    approved_by: uuid.UUID | None = None,
) -> Campaign:
    campaign.status = new_status
    if new_status == CampaignStatus.approved:
        campaign.approved_at = datetime.now(timezone.utc)
        if approved_by is not None:
            campaign.approved_by = approved_by
    await db.flush()
    return campaign


async def set_target_send_status(
    db: AsyncSession,
    target: CampaignTarget,
    new_status: SendStatus,
) -> CampaignTarget:
    target.send_status = new_status
    await db.flush()
    return target


async def attach_payment_link(
    db: AsyncSession,
    target: CampaignTarget,
    payment_link_id: uuid.UUID,
) -> CampaignTarget:
    target.payment_link_id = payment_link_id
    await db.flush()
    return target
