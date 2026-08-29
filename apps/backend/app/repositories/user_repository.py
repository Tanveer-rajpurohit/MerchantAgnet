import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.merchant_profile import MerchantProfile

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.strip().lower()))
    return result.scalar_one_or_none()

async def get_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    result = await db.execute(select(User).where(User.phone_number == phone_number.strip()))
    return result.scalar_one_or_none()

async def get_by_id(db: AsyncSession, user_id: uuid.UUID | str) -> User | None:
    parsed_id = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
    result = await db.execute(select(User).where(User.id == parsed_id))
    return result.scalar_one_or_none()

async def create_user(
    db: AsyncSession,
    full_name: str,
    email: str,
    phone_number: str,
    password_hash: str,
    role: UserRole,
) -> User:
    new_user = User(
        full_name=full_name.strip(),
        email=email.strip().lower(),
        phone_number=phone_number.strip(),
        password_hash=password_hash,
        role=role,
    )
    db.add(new_user)
    
    if role == UserRole.merchant:
        merchant_profile = MerchantProfile(
            user=new_user,
            business_name=f"{full_name.strip()}'s Store",
            business_type="General Store",
        )
        db.add(merchant_profile)

    await db.flush()
    await db.refresh(new_user)
    return new_user