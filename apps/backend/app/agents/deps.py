import uuid
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile
from app.models.user import User
from app.models.agent_run import AgentPersona

@dataclass
class StoreProfileContext:
    store_name: str
    category: str
    owner_name: str
    phone: str
    email: str
    address_line1: str
    address_line2: str
    city: str
    state: str
    pincode: str
    upi_vpa: str

    @property
    def full_address(self) -> str:
        parts = [self.address_line1, self.address_line2, self.city, self.state, self.pincode]
        valid = [p.strip() for p in parts if p and p.strip()]
        return ", ".join(valid) if valid else "Registered Store Address"

@dataclass
class MerchantAgentDeps:
    db: AsyncSession
    merchant: MerchantProfile
    user: User | None = None
    session_id: uuid.UUID | None = None
    persona: AgentPersona = AgentPersona.merchant_admin
    store_profile: StoreProfileContext | None = None
    current_date: str = ""