import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING, Any
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile
    from app.models.conversation import Conversation

class AgentPersona(str, enum.Enum):
    merchant_admin = "merchant_admin"
    customer_shopfront = "customer_shopfront"

class AgentRunStatus(str, enum.Enum):
    success = "success"
    failed = "failed"
    fallback = "fallback"

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("merchant_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    persona: Mapped[AgentPersona] = mapped_column(
        SQLEnum(AgentPersona, name="agent_persona", create_type=False),
        nullable=False,
        default=AgentPersona.merchant_admin,
    )
    user_message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    agent_response: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    tools_invoked: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        server_default="[]",
    )
    status: Mapped[AgentRunStatus] = mapped_column(
        SQLEnum(AgentRunStatus, name="agent_run_status", create_type=False),
        nullable=False,
        default=AgentRunStatus.success,
    )
    latency_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    error_detail: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    merchant_profile: Mapped["MerchantProfile"] = relationship(
        "MerchantProfile",
    )
    conversation: Mapped["Conversation | None"] = relationship(
        "Conversation",
    )
