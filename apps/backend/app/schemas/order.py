import uuid
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.models.order import OrderStatus, ActorType

class OrderItemCreate(BaseModel):
    product_id: uuid.UUID | None = None
    product_name_snapshot: str = Field(..., min_length=1, max_length=255)
    quantity: int = Field(..., ge=1)
    unit_price_snapshot: Decimal = Field(..., ge=0)

class OrderCreateRequest(BaseModel):
    merchant_id: uuid.UUID | None = None
    customer_id: uuid.UUID | None = None
    customer_connection_id: uuid.UUID | None = None
    items: list[OrderItemCreate] = Field(..., min_length=1)
    paid_amount: Decimal = Field(Decimal("0.00"), ge=0)
    status: OrderStatus = OrderStatus.unpaid
    created_by: ActorType = ActorType.merchant

class OrderUpdateRequest(BaseModel):
    status: OrderStatus | None = None
    paid_amount: Decimal | None = Field(None, ge=0)
    reason: str | None = Field(None, max_length=500)

class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID | None = None
    product_name_snapshot: str
    quantity: int
    unit_price_snapshot: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderStatusHistoryResponse(BaseModel):
    id: uuid.UUID
    previous_status: OrderStatus | None = None
    new_status: OrderStatus
    changed_by: ActorType
    reason: str | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    store_name: str
    customer_id: uuid.UUID
    customer_connection_id: uuid.UUID | None = None
    customer_name: str
    customer_phone: str | None = None
    customer_email: str
    total_amount: Decimal
    paid_amount: Decimal
    status: OrderStatus
    items: list[OrderItemResponse] = []
    status_history: list[OrderStatusHistoryResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaginatedOrderResponse(BaseModel):
    items: list[OrderResponse]
    next_cursor: datetime | None = None
    has_more: bool
    model_config = ConfigDict(from_attributes=True)