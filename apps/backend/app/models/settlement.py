import enum
import uuid
from decimal import Decimal
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, Numeric, Enum as SAEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile

class SettlementStatus(str, enum.Enum):
    pending = "pending"
    processed = "processed"
    failed = "failed"

class Settlement(Base):
    __tablename__ = "settlements"

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
    razorpay_settlement_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )
    tax: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )
    net_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="INR",
    )
    utr: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="NEFT",
    )
    status: Mapped[SettlementStatus] = mapped_column(
        SAEnum(SettlementStatus, name="settlement_status", native_enum=True),
        nullable=False,
        default=SettlementStatus.pending,
        server_default="pending",
    )
    settled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
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