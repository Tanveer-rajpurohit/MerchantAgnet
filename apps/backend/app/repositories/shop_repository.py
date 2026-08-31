import uuid
from datetime import datetime
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile
from app.models.user import User
from app.models.address import Address

def merchant_eager_options():
    return [
        selectinload(MerchantProfile.user).selectinload(User.addresses),
        selectinload(MerchantProfile.products),
    ]

async def get_by_id(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
) -> MerchantProfile | None:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = (
        select(MerchantProfile)
        .options(*merchant_eager_options())
        .where(MerchantProfile.id == m_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_shops(
    db: AsyncSession,
    search: str | None = None,
    category: str | None = None,
    cursor: datetime | None = None,
    limit: int = 20,
) -> list[MerchantProfile]:
    query = (
        select(MerchantProfile)
        .options(*merchant_eager_options())
        .join(User, MerchantProfile.user_id == User.id)
    )

    if category and category.strip() and category.strip().lower() != "all":
        query = query.where(MerchantProfile.business_type.ilike(f"%{category.strip()}%"))

    if search and search.strip():
        term = search.strip()
        like_term = f"%{term}%"
        address_exists = (
            select(Address.id)
            .where(
                Address.user_id == User.id,
                or_(
                    Address.city.op("%")(term),
                    Address.city.ilike(like_term),
                    Address.line1.op("%")(term),
                    Address.line1.ilike(like_term),
                    Address.landmark.ilike(like_term),
                ),
            )
            .exists()
        )
        query = query.where(
            or_(
                MerchantProfile.business_name.op("%")(term),
                MerchantProfile.business_name.ilike(like_term),
                MerchantProfile.business_type.ilike(like_term),
                User.full_name.op("%")(term),
                User.full_name.ilike(like_term),
                address_exists,
            )
        )

    if cursor is not None:
        query = query.where(MerchantProfile.created_at < cursor)

    if search and search.strip():
        term = search.strip()
        city_score = (
            select(func.max(func.similarity(Address.city, term)))
            .where(Address.user_id == User.id)
            .scalar_subquery()
        )
        score = func.greatest(
            func.similarity(MerchantProfile.business_name, term),
            func.similarity(User.full_name, term),
            func.coalesce(city_score, 0),
        )
        query = query.order_by(score.desc(), MerchantProfile.created_at.desc())
    else:
        query = query.order_by(MerchantProfile.created_at.desc())

    query = query.limit(limit + 1)
    result = await db.execute(query)
    return list(result.scalars().all())
