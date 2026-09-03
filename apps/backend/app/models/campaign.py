import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.conversation import SendStatus

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile
    from app.models.customer_connection import CustomerConnection
    from app.models.payment_link import PaymentLink
    from app.models.user import User

class CampaignStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    sending = "sending"
    sent = "sent"
    cancelled = "cancelled"

class Campaign(Base):
    __tablename__ = "campaigns"

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
    offer_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    segment_description: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    discount_percent: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="0%",
        server_default="0%",
    )
    status: Mapped[CampaignStatus] = mapped_column(
        SAEnum(CampaignStatus, name="campaign_status", native_enum=True),
        nullable=False,
        default=CampaignStatus.draft,
        server_default="draft",
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
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
    approved_by_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[approved_by],
    )
    targets: Mapped[list["CampaignTarget"]] = relationship(
        "CampaignTarget",
        back_populates="campaign",
        cascade="all, delete-orphan",
    )

class CampaignTarget(Base):
    __tablename__ = "campaign_targets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    customer_connection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customer_connections.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    payment_link_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("payment_links.id", ondelete="SET NULL"),
        nullable=True,
    )
    send_status: Mapped[SendStatus] = mapped_column(
        SAEnum(SendStatus, name="send_status", create_type=False),
        nullable=False,
        default=SendStatus.pending,
        server_default="pending",
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

    campaign: Mapped["Campaign"] = relationship(
        "Campaign",
        back_populates="targets",
    )
    customer_connection: Mapped["CustomerConnection"] = relationship(
        "CustomerConnection",
    )
    payment_link: Mapped["PaymentLink | None"] = relationship(
        "PaymentLink",
    )
