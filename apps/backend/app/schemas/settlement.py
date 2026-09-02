import uuid
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.settlement import SettlementStatus

class SettlementResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    razorpay_settlement_id: str
    amount: Decimal
    fee: Decimal
    tax: Decimal
    net_amount: Decimal
    currency: str
    utr: str | None = None
    method: str
    status: SettlementStatus
    created_at: datetime
    settled_at: datetime | None = None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class SettlementListResponse(BaseModel):
    items: list[SettlementResponse]
    total_count: int
    page: int
    count: int
    total_pages: int
    model_config = ConfigDict(from_attributes=True)

class PayoutsSummaryResponse(BaseModel):
    available_balance: Decimal
    total_settled: Decimal
    pending_settlement: Decimal
    settlement_count: int
    model_config = ConfigDict(from_attributes=True)