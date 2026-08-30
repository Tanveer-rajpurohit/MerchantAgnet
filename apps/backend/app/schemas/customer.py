import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.customer_connection import ConnectionStatus

class CustomerConnectionCreateRequest(BaseModel):
    merchant_id: uuid.UUID
    customer_id: uuid.UUID | None = None

class CustomerConnectionResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    customer_id: uuid.UUID
    customer_name: str
    customer_phone: str | None = None
    customer_email: str
    customer_profile_picture: str | None = None
    status: ConnectionStatus
    messages_used: int
    total_spent: Decimal
    connected_at: datetime | None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaginatedCustomerConnectionResponse(BaseModel):
    items: list[CustomerConnectionResponse]
    next_cursor: datetime | None = None
    has_more: bool
    model_config = ConfigDict(from_attributes=True)
