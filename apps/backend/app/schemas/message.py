import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.conversation import SenderType, SendStatus

class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_type: SenderType
    content: str
    status: SendStatus
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaginatedMessageResponse(BaseModel):
    items: list[MessageResponse]
    next_cursor: datetime | None = None
    has_more: bool
    model_config = ConfigDict(from_attributes=True)
