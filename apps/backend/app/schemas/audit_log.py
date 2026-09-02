import uuid
from typing import Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID | None = None
    user_id: uuid.UUID | None = None
    action: str
    entity_type: str
    entity_id: str
    details: dict[str, Any]
    ip_address: str | None = None
    user_agent: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaginatedAuditLogResponse(BaseModel):
    items: list[AuditLogResponse]
    next_cursor: datetime | None = None
    has_more: bool
    model_config = ConfigDict(from_attributes=True)

AuditLogCursorResponse = PaginatedAuditLogResponse