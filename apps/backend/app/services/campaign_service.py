import logging
import re
import urllib.parse
import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.campaign import Campaign, CampaignStatus
from app.models.conversation import SendStatus, SenderType
from app.models.payment_link import PaymentLink, PaymentLinkStatus
from app.models.merchant_profile import MerchantProfile
from app.repositories import campaign_repository, audit_log_repository, message_repository
from app.websockets.manager import manager
from app.services.razorpay_client_factory import get_merchant_razorpay_client
from app.schemas.campaign import (
    CampaignResponse,
    CampaignSummaryDTO,
    CampaignTargetDTO,
    CampaignListResponse,
    CampaignApproveResult,
    CampaignDeclineResult,
)
from app.core.config import settings

logger = logging.getLogger(__name__)


def resolve_campaign_message(
    template: str,
    customer_name: str,
    store_name: str,
    offer_description: str,
    segment_description: str,
    discount_percent: str,
    current_date: str | None = None,
) -> str:
    """Resolve all placeholders (name, store, date, offer, discount, min_amount) into real text."""
    msg = template or ""

    disc = (discount_percent or "").strip()
    if disc and not disc.endswith("%"):
        disc = f"{disc}%"

    combined = f"{offer_description} {segment_description} {template}"
    min_match = re.search(
        r'(?:₹|rs\.?|inr|orders?\s*(?:of|above|over|crossing)?\s*₹?\s*)(\d+[\d,]*)',
        combined,
        re.IGNORECASE,
    )
    min_amount = min_match.group(1).replace(",", "") if min_match else ""

    date_str = (current_date or datetime.now().strftime("%B %d, %Y")).strip()

    for tag in ("{name}", "{{name}}", "{customer_name}", "{{customer_name}}", "{customer}", "{{customer}}"):
        msg = msg.replace(tag, customer_name)

    for tag in ("{store}", "{{store}}", "{shop}", "{{shop}}", "{store_name}", "{{store_name}}"):
        msg = msg.replace(tag, store_name)

    for tag in ("{date}", "{{date}}", "{current_date}", "{{current_date}}", "{valid_date}", "{{valid_date}}"):
        msg = msg.replace(tag, date_str)

    for tag in ("{offer}", "{{offer}}", "{offer_description}", "{{offer_description}}"):
        msg = msg.replace(tag, offer_description.strip())

    for tag in ("{discount}", "{{discount}}", "{discount_percent}", "{{discount_percent}}"):
        msg = msg.replace(tag, disc or offer_description.strip())

    if min_amount:
        for tag in ("{min_amount}", "{{min_amount}}", "{min_order}", "{{min_order}}", "{condition}", "{{condition}}"):
            msg = msg.replace(tag, min_amount)
    else:
        msg = re.sub(r'₹?\s*\{+min_amount\}+', 'qualifying amount', msg)
        msg = re.sub(r'\{+min_order\}+', 'qualifying order', msg)
        msg = re.sub(r'\{+condition\}+', 'qualifying terms', msg)

    # Clean up any leftover {tag} or {{tag}}
    msg = re.sub(r'\{+([a-zA-Z0-9_]+)\}+', r'\1', msg)
    msg = re.sub(r'[ \t]+', ' ', msg).strip()
    return msg


def _target_to_dto(target) -> CampaignTargetDTO:
    conn = target.customer_connection
    cust = conn.customer if conn else None
    return CampaignTargetDTO(
        id=target.id,
        customer_connection_id=target.customer_connection_id,
        customer_name=cust.full_name if cust else "",
        customer_phone=cust.phone_number if cust else None,
        message_content=target.message_content,
        payment_link_id=target.payment_link_id,
        payment_link_url=None,
        send_status=target.send_status,
        created_at=target.created_at,
    )


def _campaign_to_response(campaign: Campaign) -> CampaignResponse:
    return CampaignResponse(
        id=campaign.id,
        merchant_id=campaign.merchant_id,
        offer_description=campaign.offer_description,
        segment_description=campaign.segment_description,
        discount_percent=campaign.discount_percent,
        status=campaign.status,
        target_count=len(campaign.targets) if campaign.targets else 0,
        targets=[_target_to_dto(t) for t in (campaign.targets or [])],
        created_at=campaign.created_at,
        approved_at=campaign.approved_at,
        approved_by=campaign.approved_by,
        updated_at=campaign.updated_at,
    )


def _campaign_to_summary(campaign: Campaign) -> CampaignSummaryDTO:
    return CampaignSummaryDTO(
        id=campaign.id,
        offer_description=campaign.offer_description,
        segment_description=campaign.segment_description,
        discount_percent=campaign.discount_percent,
        status=campaign.status,
        target_count=0,
        created_at=campaign.created_at,
        updated_at=campaign.updated_at,
    )


async def list_campaigns(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    status_filter: CampaignStatus | None = None,
) -> CampaignListResponse:
    rows = await campaign_repository.list_by_merchant(
        db=db, merchant_id=merchant_id, status_filter=status_filter
    )
    items = [_campaign_to_summary(c) for c in rows]
    return CampaignListResponse(items=items, total=len(items))


async def get_campaign(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    campaign_id: uuid.UUID,
) -> CampaignResponse:
    campaign = await campaign_repository.get_by_id(db, campaign_id, merchant_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found",
        )
    return _campaign_to_response(campaign)


async def approve_and_send(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    campaign_id: uuid.UUID,
    approver_user_id: uuid.UUID,
) -> CampaignApproveResult:
    campaign = await campaign_repository.get_by_id(db, campaign_id, merchant_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.status != CampaignStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only draft campaigns can be approved. Current status: {campaign.status.value}",
        )

    merchant = await db.get(MerchantProfile, merchant_id)

    await campaign_repository.mark_status(db, campaign, CampaignStatus.approved, approved_by=approver_user_id)
    await campaign_repository.mark_status(db, campaign, CampaignStatus.sending)

    sent_count = 0
    failed_count = 0
    approval_date = datetime.now().strftime("%B %d, %Y")
    store_name = (merchant.business_name if merchant else "our store") or "our store"

    for target in campaign.targets:
        try:
            conn = target.customer_connection

            # Send campaign message directly into customer's chat connection
            if conn:
                cust = conn.customer if hasattr(conn, "customer") else None
                cust_name = (cust.full_name if cust else "there") or "there"

                msg_content = resolve_campaign_message(
                    template=target.message_content,
                    customer_name=cust_name,
                    store_name=store_name,
                    offer_description=campaign.offer_description,
                    segment_description=campaign.segment_description,
                    discount_percent=campaign.discount_percent,
                    current_date=approval_date,
                )

                if merchant:
                    shop_url = f"{settings.FRONTEND_URL}/shops/{merchant.id}"
                    msg_content += f"\n\nShop Link: {shop_url}"

                saved_msg = await message_repository.save_message_to_connection(
                    db=db,
                    customer_connection_id=conn.id,
                    sender_type=SenderType.merchant,
                    content=msg_content,
                    status=SendStatus.sent,
                )

                # Broadcast to customer's live WebSocket if open
                msg_payload = {
                    "id": str(saved_msg.id),
                    "conversation_id": str(saved_msg.conversation_id),
                    "sender_type": saved_msg.sender_type.value,
                    "content": saved_msg.content,
                    "status": saved_msg.status.value,
                    "created_at": saved_msg.created_at.isoformat(),
                }
                await manager.broadcast(
                    connection_id=conn.id,
                    message={"type": "new_message", "message": msg_payload},
                )

            await campaign_repository.set_target_send_status(db, target, SendStatus.sent)
            sent_count += 1
        except Exception as target_err:
            logger.error("Campaign target %s failed: %s", target.id, target_err, exc_info=True)
            await campaign_repository.set_target_send_status(db, target, SendStatus.failed)
            failed_count += 1

    final_status = CampaignStatus.sent if failed_count == 0 and sent_count > 0 else (
        CampaignStatus.sending if sent_count > 0 else CampaignStatus.approved
    )
    await campaign_repository.mark_status(db, campaign, final_status)

    await audit_log_repository.log_action(
        db=db,
        action="campaign.approved",
        entity_type="campaign",
        entity_id=str(campaign.id),
        merchant_id=merchant_id,
        user_id=approver_user_id,
        details={
            "sent": sent_count,
            "failed": failed_count,
        },
    )
    await db.commit()

    campaign = await campaign_repository.get_by_id(db, campaign_id, merchant_id)
    return CampaignApproveResult(
        campaign_id=campaign.id,
        status=campaign.status,
        sent_count=sent_count,
        failed_count=failed_count,
        targets=[_target_to_dto(t) for t in (campaign.targets or [])],
    )


async def decline(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    campaign_id: uuid.UUID,
    decliner_user_id: uuid.UUID,
) -> CampaignDeclineResult:
    campaign = await campaign_repository.get_by_id(db, campaign_id, merchant_id)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    if campaign.status in (CampaignStatus.sent, CampaignStatus.cancelled):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot decline a campaign that is already {campaign.status.value}.",
        )

    await campaign_repository.mark_status(db, campaign, CampaignStatus.cancelled)

    await audit_log_repository.log_action(
        db=db,
        action="campaign.declined",
        entity_type="campaign",
        entity_id=str(campaign.id),
        merchant_id=merchant_id,
        user_id=decliner_user_id,
        details={"previous_status": campaign.status.value if hasattr(campaign.status, "value") else str(campaign.status)},
    )
    await db.commit()

    return CampaignDeclineResult(
        campaign_id=campaign.id,
        status=CampaignStatus.cancelled,
        message="Campaign declined. No messages were sent.",
    )
