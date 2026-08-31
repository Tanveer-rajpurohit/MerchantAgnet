import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Integer, Numeric, DateTime, Enum as SAEnum, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile
    from app.models.user import User
    from app.models.order import Order
    from app.models.conversation import Conversation

class ConnectionStatus(str, enum.Enum):
    pending = "pending"
    connected = "connected"

class CustomerConnection(Base):
    __tablename__ = "customer_connections"
    __table_args__ = (
        UniqueConstraint("merchant_id", "customer_id", name="uq_merchant_customer"),
    )

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
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[ConnectionStatus] = mapped_column(
        SAEnum(ConnectionStatus, name="connection_status", native_enum=True),
        nullable=False,
        default=ConnectionStatus.pending,
        server_default="pending",
    )
    messages_used: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    total_spent: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0",
    )
    connected_at: Mapped[datetime | None] = mapped_column(
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

    merchant_profile: Mapped["MerchantProfile"] = relationship(
        "MerchantProfile",
        back_populates="customer_connections",
    )
    customer: Mapped["User"] = relationship(
        "User",
        back_populates="customer_connections",
    )
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="customer_connection",
    )
    conversation: Mapped["Conversation | None"] = relationship(
        "Conversation",
        back_populates="customer_connection",
        uselist=False,
        cascade="all, delete-orphan",
    )
