import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User

class Address(Base):
    __tablename__ = "addresses"
    __table_args__ = (
        Index("ix_addresses_city_trgm", "city", postgresql_using="gin", postgresql_ops={"city": "gin_trgm_ops"}),
        Index("ix_addresses_line1_trgm", "line1", postgresql_using="gin", postgresql_ops={"line1": "gin_trgm_ops"}),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    line1: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    line2: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    landmark: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    country: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        server_default="India",
    )
    pincode: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="addresses",
    )
