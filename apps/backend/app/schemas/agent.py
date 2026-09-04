import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.agent_run import AgentPersona, AgentRunStatus

class AttachedCustomerDTO(BaseModel):
    customer_id: uuid.UUID | None = None
    customer_connection_id: uuid.UUID | None = None
    customer_name: str | None = None
    customer_phone: str | None = None

class AgentChatRequest(BaseModel):
    message: str
    session_id: uuid.UUID | None = None
    persona: AgentPersona = AgentPersona.merchant_admin
    target_customer_id: uuid.UUID | None = None
    target_customer_connection_id: uuid.UUID | None = None
    target_customer_name: str | None = None
    target_customer_phone: str | None = None
    target_customers: list[AttachedCustomerDTO] | None = None

class RenameSessionRequest(BaseModel):
    title: str

class AgentRunDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID | None
    merchant_id: uuid.UUID
    persona: AgentPersona
    user_message: str
    agent_response: str
    tools_invoked: list[dict]
    status: AgentRunStatus
    latency_ms: int | None = None
    created_at: datetime

class ChatSessionSummaryDTO(BaseModel):
    session_id: uuid.UUID
    title: str
    last_message: str
    last_active_at: datetime
    total_turns: int

class ChatSessionListResponse(BaseModel):
    sessions: list[ChatSessionSummaryDTO]
    next_cursor: datetime | None = None
    has_more: bool = False

class ChatSessionHistoryResponse(BaseModel):
    session_id: uuid.UUID
    runs: list[AgentRunDTO]
    total_turns: int