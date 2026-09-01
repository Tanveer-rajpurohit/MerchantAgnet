import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.product import ProductResponse

class ShopAddressResponse(BaseModel):
    line1: str
    line2: str | None = None
    landmark: str | None = None
    city: str
    state: str
    pincode: str
    model_config = ConfigDict(from_attributes=True)

class ShopListItem(BaseModel):
    id: uuid.UUID
    business_name: str
    business_type: str
    owner_name: str
    owner_phone: str | None = None
    city: str | None = None
    area: str | None = None
    address: ShopAddressResponse | None = None
    popular_products: list[str] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ShopDetail(ShopListItem):
    business_description: str | None = None
    upi_vpa: str | None = None
    preferred_language: str
    products: list[ProductResponse] = []
    customer_connection_id: uuid.UUID | None = None
    conversation_id: uuid.UUID | None = None
    model_config = ConfigDict(from_attributes=True)

class PaginatedShopResponse(BaseModel):
    items: list[ShopListItem]
    next_cursor: datetime | None = None
    has_more: bool
    model_config = ConfigDict(from_attributes=True)
