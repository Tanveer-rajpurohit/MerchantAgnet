import uuid
from pydantic import BaseModel
from app.models.agent_run import AgentPersona

class AgentChatRequest(BaseModel):
    message: str
    session_id: uuid.UUID | None = None
    persona: AgentPersona = AgentPersona.merchant_admin