import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.product import Product
    from app.models.expense import Expense
    from app.models.ai_info import AIInfo

class MerchantProfile(Base):
    __tablename__ = "merchant_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    business_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    business_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    business_description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    gstin: Mapped[str | None] = mapped_column(
        String(15),
        nullable=True,
    )
    upi_vpa: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    preferred_language: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default="English",
    )
    razorpay_key_id_encrypted: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    razorpay_key_secret_encrypted: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    is_razorpay_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="merchant_profile",
    )
    ai_info: Mapped["AIInfo | None"] = relationship(
        "AIInfo",
        back_populates="merchant_profile",
        uselist=False,
        cascade="all, delete-orphan",
    )
    expenses: Mapped[list["Expense"]] = relationship(
        "Expense",
        back_populates="merchant_profile",
        cascade="all, delete-orphan",
    )
    products: Mapped[list["Product"]] = relationship(
        "Product",
        back_populates="merchant_profile",
        cascade="all, delete-orphan",
    )
