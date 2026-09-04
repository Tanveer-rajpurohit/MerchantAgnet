import asyncio
import uuid
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile


@dataclass
class CustomerAgentDeps:
    db: AsyncSession
    merchant: MerchantProfile
    merchant_id: uuid.UUID
    customer_id: uuid.UUID | None = None
    customer_name: str = ""
    customer_phone: str = ""
    connection_id: uuid.UUID | None = None
    store_name: str = ""
    store_category: str = ""
    store_address: str = ""
    store_upi_vpa: str = ""
    created_orders: list[dict] = field(default_factory=list)
    created_payment_links: list[dict] = field(default_factory=list)
    db_lock: asyncio.Lock = field(default_factory=asyncio.Lock)
