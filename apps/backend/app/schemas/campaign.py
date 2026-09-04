import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.campaign import CampaignStatus
from app.models.conversation import SendStatus


class CampaignTargetDTO(BaseModel):
    id: uuid.UUID
    customer_connection_id: uuid.UUID
    customer_name: str = ""
    customer_phone: str | None = None
    message_content: str
    payment_link_id: uuid.UUID | None = None
    payment_link_url: str | None = None
    send_status: SendStatus
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CampaignResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    offer_description: str
    segment_description: str
    discount_percent: str
    status: CampaignStatus
    target_count: int
    targets: list[CampaignTargetDTO] = []
    created_at: datetime
    approved_at: datetime | None = None
    approved_by: uuid.UUID | None = None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CampaignSummaryDTO(BaseModel):
    id: uuid.UUID
    offer_description: str
    segment_description: str
    discount_percent: str
    status: CampaignStatus
    target_count: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CampaignListResponse(BaseModel):
    items: list[CampaignSummaryDTO]
    total: int


class CampaignApproveResult(BaseModel):
    campaign_id: uuid.UUID
    status: CampaignStatus
    sent_count: int
    failed_count: int
    targets: list[CampaignTargetDTO]


class CampaignDeclineResult(BaseModel):
    campaign_id: uuid.UUID
    status: CampaignStatus
    message: str
