import uuid
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.payment_link import PaymentLinkStatus

class PaymentLinkCreateRequest(BaseModel):
    customer_id: uuid.UUID | None = None
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field("INR", min_length=3, max_length=3)
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_phone: str | None = Field(None, max_length=20)
    customer_email: str | None = Field(None, max_length=255)
    description: str = Field(..., min_length=1, max_length=500)
    order_id: uuid.UUID | None = None
    notify_sms: bool = False
    notify_email: bool = False

class PaymentLinkVerifyRequest(BaseModel):
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_payment_link_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)

class PaymentLinkResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    order_id: uuid.UUID | None = None
    customer_id: uuid.UUID | None = None
    customer_name: str
    customer_phone: str | None = None
    customer_email: str | None = None
    description: str
    amount: Decimal
    currency: str
    receipt_number: str | None = None
    razorpay_link_id: str | None = None
    razorpay_link_url: str | None = None
    callback_url: str | None = None
    callback_method: str
    razorpay_payment_id: str | None = None
    payment_method: str | None = None
    status: PaymentLinkStatus
    notify_sms: bool
    notify_email: bool
    created_at: datetime
    paid_at: datetime | None = None
    cancelled_at: datetime | None = None
    expired_at: datetime | None = None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PaymentLinkListResponse(BaseModel):
    items: list[PaymentLinkResponse]
    total_count: int
    page: int
    count: int
    total_pages: int
    model_config = ConfigDict(from_attributes=True)
