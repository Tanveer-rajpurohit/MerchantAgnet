import enum
import uuid
from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Text, Numeric, Enum as SAEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile
    from app.models.order import Order
    from app.models.user import User

class PaymentLinkStatus(str, enum.Enum):
    created = "created"
    partially_paid = "partially_paid"
    paid = "paid"
    expired = "expired"
    cancelled = "cancelled"

class PaymentLink(Base):
    __tablename__ = "payment_links"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("merchant_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    customer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    customer_phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    customer_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    description: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="INR",
    )
    receipt_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    razorpay_link_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )
    razorpay_link_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    callback_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    callback_method: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="get",
    )
    razorpay_payment_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    razorpay_signature: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    payment_method: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    status: Mapped[PaymentLinkStatus] = mapped_column(
        SAEnum(PaymentLinkStatus, name="payment_link_status", native_enum=True),
        nullable=False,
        default=PaymentLinkStatus.created,
        server_default="created",
    )
    notify_sms: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    notify_email: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    expired_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    merchant: Mapped["MerchantProfile"] = relationship(
        "MerchantProfile",
    )
    order: Mapped["Order | None"] = relationship(
        "Order",
    )
    customer: Mapped["User | None"] = relationship(
        "User",
    )