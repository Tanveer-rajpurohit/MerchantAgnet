import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, Float, DateTime, ForeignKey, func, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.models.merchant_profile import MerchantProfile

class KnowledgeSourceType(str, enum.Enum):
    product = "product"
    shop_profile = "shop_profile"
    faq = "faq"
    policy = "policy"

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

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
    source_type: Mapped[KnowledgeSourceType] = mapped_column(
        SQLEnum(KnowledgeSourceType, name="knowledge_source_type", create_type=False),
        nullable=False,
        default=KnowledgeSourceType.product,
    )
    source_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    embedding: Mapped[list[float]] = mapped_column(
        ARRAY(Float),
        nullable=False,
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
    )
