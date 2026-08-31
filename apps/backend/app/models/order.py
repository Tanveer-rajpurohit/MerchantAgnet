import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Numeric, DateTime, Text, Enum as SAEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile
    from app.models.user import User
    from app.models.customer_connection import CustomerConnection
    from app.models.product import Product

class OrderStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    cancelled = "cancelled"

class ActorType(str, enum.Enum):
    merchant = "merchant"
    customer = "customer"
    system = "system"
    ai_agent = "ai_agent"

class Order(Base):
    __tablename__ = "orders"

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
    customer_connection_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customer_connections.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
        server_default="0",
    )
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=True),
        nullable=False,
        default=OrderStatus.unpaid,
        server_default="unpaid",
        index=True,
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
        back_populates="orders",
    )
    customer: Mapped["User"] = relationship(
        "User",
        back_populates="orders",
    )
    customer_connection: Mapped["CustomerConnection | None"] = relationship(
        "CustomerConnection",
        back_populates="orders",
    )
    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    status_history: Mapped[list["OrderStatusHistory"]] = relationship(
        "OrderStatusHistory",
        back_populates="order",
        cascade="all, delete-orphan",
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    product_name_snapshot: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    unit_price_snapshot: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="items",
    )
    product: Mapped["Product | None"] = relationship(
        "Product",
    )

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    previous_status: Mapped[OrderStatus | None] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=True),
        nullable=True,
    )
    new_status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=True),
        nullable=False,
    )
    changed_by: Mapped[ActorType] = mapped_column(
        SAEnum(ActorType, name="actor_type", native_enum=True),
        nullable=False,
    )
    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="status_history",
    )
