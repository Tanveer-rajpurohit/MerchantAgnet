import logging
import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.campaign import Campaign, CampaignTarget, CampaignStatus
from app.models.customer_connection import CustomerConnection, ConnectionStatus
from app.models.conversation import SendStatus
from app.repositories import audit_log_repository
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def create_campaign(
    ctx: RunContext[MerchantAgentDeps],
    offer_description: str,
    segment_description: str,
    discount_percent: str,
    customer_connection_ids: list[str],
    message_template: str,
) -> str:
    """Create a marketing campaign draft targeted at a list of connected customers.

    Call this when the merchant wants to broadcast a promotion, sale, or offer to customers.
    - offer_description: The promotional offer (e.g. '10% off on all groceries this weekend').
    - segment_description: Description of the targeted audience segment (e.g. 'Loyal customers with >₹1000 spend').
    - discount_percent: The discount percentage string (e.g. '10%', '15%').
    - customer_connection_ids: List of customer connection UUID strings to receive the campaign.
    - message_template: Template text containing placeholders {name}, {offer}, {store}.
    Creates a draft campaign with personalized messages for each customer awaiting merchant approval.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)
        merchant = ctx.deps.merchant
        store_name = merchant.business_name

        unique_ids: list[uuid.UUID] = []
        seen: set[str] = set()
        for raw_id in customer_connection_ids:
            sid = str(raw_id)
            if sid in seen:
                continue
            seen.add(sid)
            try:
                unique_ids.append(uuid.UUID(sid))
            except (ValueError, AttributeError):
                continue

        if not unique_ids:
            return "No valid customer connection ids supplied. Call get_recent_customers first."

        stmt = (
            select(CustomerConnection)
            .where(
                CustomerConnection.merchant_id == merchant_id,
                CustomerConnection.id.in_(unique_ids),
                CustomerConnection.status == ConnectionStatus.connected,
            )
            .options(selectinload(CustomerConnection.customer))
        )
        conns = (await ctx.deps.db.execute(stmt)).scalars().all()
        if not conns:
            return "None of the supplied customers are connected to this store."

        campaign = Campaign(
            merchant_id=merchant_id,
            offer_description=offer_description.strip(),
            segment_description=segment_description.strip()[:500],
            discount_percent=(discount_percent or "0%").strip()[:10],
            status=CampaignStatus.draft,
        )
        ctx.deps.db.add(campaign)
        await ctx.deps.db.flush()

        sample_message: str | None = None
        targets_created = 0
        for conn in conns:
            cust = conn.customer
            cust_name = (cust.full_name if cust else "there") or "there"

            personalized = (
                message_template
                .replace("{name}", cust_name)
                .replace("{offer}", offer_description.strip())
                .replace("{store}", store_name)
            )
            if sample_message is None:
                sample_message = personalized

            target = CampaignTarget(
                campaign_id=campaign.id,
                customer_connection_id=conn.id,
                message_content=personalized,
                send_status=SendStatus.pending,
            )
            ctx.deps.db.add(target)
            targets_created += 1

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="campaign.drafted",
            entity_type="campaign",
            entity_id=str(campaign.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={
                "offer": offer_description,
                "segment": segment_description,
                "discount": discount_percent,
                "target_count": targets_created,
            },
        )
        await ctx.deps.db.commit()

        return (
            f"CAMPAIGN_DRAFT_CREATED\n"
            f"CAMPAIGN_ID: {campaign.id}\n"
            f"OFFER: {offer_description}\n"
            f"SEGMENT: {segment_description}\n"
            f"DISCOUNT: {discount_percent}\n"
            f"TARGET_COUNT: {targets_created}\n"
            f"SAMPLE_MESSAGE:\n{sample_message or '(none)'}\n"
            f"NEXT_STEP: The merchant must Approve this draft on the Campaigns page to send it."
        )
    except Exception as e:
        logger.error("Error in create_campaign: %s", e, exc_info=True)
        return f"Failed to draft campaign: {str(e)}"
