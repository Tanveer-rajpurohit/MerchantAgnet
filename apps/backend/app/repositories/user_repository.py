import uuid
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.merchant_profile import MerchantProfile
from app.models.user_settings import UserSettings

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.strip().lower()))
    return result.scalar_one_or_none()

async def get_by_phone(db: AsyncSession, phone_number: str) -> User | None:
    result = await db.execute(select(User).where(User.phone_number == phone_number.strip()))
    return result.scalar_one_or_none()

async def get_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    result = await db.execute(select(User).where(User.google_id == google_id.strip()))
    return result.scalar_one_or_none()

async def get_by_id(db: AsyncSession, user_id: uuid.UUID | str) -> User | None:
    parsed_id = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
    query = (
        select(User)
        .options(selectinload(User.merchant_profile))
        .where(User.id == parsed_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_user(
    db: AsyncSession,
    full_name: str,
    email: str,
    password_hash: str,
    phone_number: str | None = None,
    role: UserRole = UserRole.customer,
) -> User:
    new_user = User(
        full_name=full_name.strip(),
        email=email.strip().lower(),
        phone_number=phone_number.strip() if phone_number else None,
        password_hash=password_hash,
        role=role,
    )
    db.add(new_user)
    
    settings = UserSettings(user=new_user)
    db.add(settings)

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

async def create_google_user(
    db: AsyncSession,
    full_name: str,
    email: str,
    google_id: str,
    profile_picture: str | None = None,
    role: UserRole = UserRole.customer,
) -> User:
    new_user = User(
        full_name=full_name.strip(),
        email=email.strip().lower(),
        google_id=google_id.strip(),
        profile_picture=profile_picture,
        password_hash=None,
        phone_number=None,
        role=role,
    )
    db.add(new_user)

    settings = UserSettings(user=new_user)
    db.add(settings)

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

async def link_google_id(
    db: AsyncSession,
    user: User,
    google_id: str,
    profile_picture: str | None = None,
) -> User:
    user.google_id = google_id.strip()
    if profile_picture and not user.profile_picture:
        user.profile_picture = profile_picture
    await db.flush()
    await db.refresh(user)
    return user 

async def update_password(db: AsyncSession, user_id: uuid.UUID, password_hash: str) -> None:
    await db.execute(
        update(User).where(User.id == user_id).values(password_hash=password_hash)
    )
    await db.commit()