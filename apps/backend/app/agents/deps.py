import uuid
from dataclasses import dataclass, field
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
    user_id: uuid.UUID | None = None
    session_id: uuid.UUID | None = None
    persona: AgentPersona = AgentPersona.merchant_admin
    store_profile: StoreProfileContext | None = None
    current_date: str = ""
    target_customer_id: uuid.UUID | None = None
    target_customer_connection_id: uuid.UUID | None = None
    target_customer_name: str | None = None
    target_customer_phone: str | None = None
    target_customers: list[dict] = field(default_factory=list)
    created_payment_links: list[dict] = field(default_factory=list)
    sent_messages: list[dict] = field(default_factory=list)
    created_orders: list[dict] = field(default_factory=list)
    created_campaigns: list[dict] = field(default_factory=list)