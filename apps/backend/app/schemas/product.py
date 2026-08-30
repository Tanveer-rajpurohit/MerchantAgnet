import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class ProductCreateRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=255)
    cost_price: Decimal = Field(..., ge=0)
    selling_price: Decimal = Field(..., ge=0)
    current_stock: int = Field(0, ge=0)
    low_stock_alert: int = Field(0, ge=0)

class ProductUpdateRequest(BaseModel):
    product_name: str | None = Field(None, min_length=1, max_length=255)
    cost_price: Decimal | None = Field(None, ge=0)
    selling_price: Decimal | None = Field(None, ge=0)
    current_stock: int | None = Field(None, ge=0)
    low_stock_alert: int | None = Field(None, ge=0)
    is_active: bool | None = None

class ProductResponse(BaseModel):
    id: uuid.UUID
    product_name: str
    cost_price: Decimal
    selling_price: Decimal
    current_stock: int
    low_stock_alert: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)