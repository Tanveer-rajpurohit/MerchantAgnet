import uuid
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile
from app.models.user import User
from app.models.agent_run import AgentPersona

@dataclass
class MerchantAgentDeps:
    db: AsyncSession
    merchant: MerchantProfile
    user: User | None = None
    session_id: uuid.UUID | None = None
    persona: AgentPersona = AgentPersona.merchant_admin