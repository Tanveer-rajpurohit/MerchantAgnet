import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.address import Address
from app.models.merchant_profile import MerchantProfile
from app.models.user_settings import UserSettings
from app.models.ai_info import AIInfo

async def get_user_with_relations(
    db: AsyncSession,
    user_id: uuid.UUID | str,
) -> User | None:
    parsed_id = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
    query = (
        select(User)
        .options(
            selectinload(User.merchant_profile).selectinload(MerchantProfile.ai_info),
            selectinload(User.merchant_profile).selectinload(MerchantProfile.expenses),
            selectinload(User.addresses),
            selectinload(User.settings),
        )
        .where(User.id == parsed_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_user_with_settings(
    db: AsyncSession,
    user_id: uuid.UUID | str,
) -> User | None:
    parsed_id = uuid.UUID(str(user_id)) if isinstance(user_id, str) else user_id
    query = (
        select(User)
        .options(
            selectinload(User.settings),
            selectinload(User.merchant_profile).selectinload(MerchantProfile.ai_info),
        )
        .where(User.id == parsed_id)
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

def get_or_create_default_address(db: AsyncSession, user: User) -> Address:
    for addr in user.addresses:
        if addr.is_default:
            return addr
    if len(user.addresses) > 0:
        return user.addresses[0]
    
    new_addr = Address(
        user=user,
        label="Shop / Primary",
        is_default=True,
        line1="",
        city="",
        state="",
        pincode="",
    )
    db.add(new_addr)
    user.addresses.append(new_addr)
    return new_addr

def get_or_create_settings(db: AsyncSession, user: User) -> UserSettings:
    if user.settings is not None:
        return user.settings
    settings = UserSettings(user=user)
    db.add(settings)
    user.settings = settings
    return settings

def get_or_create_merchant_profile(db: AsyncSession, user: User) -> MerchantProfile:
    if user.merchant_profile is not None:
        return user.merchant_profile
    profile = MerchantProfile(
        user=user,
        business_name=f"{user.full_name}'s Store",
        business_type="General Store",
    )
    db.add(profile)
    user.merchant_profile = profile
    return profile

def get_or_create_ai_info(db: AsyncSession, merchant_profile: MerchantProfile, help_with: str = "") -> AIInfo:
    if merchant_profile.ai_info is not None:
        return merchant_profile.ai_info
    ai_info = AIInfo(
        merchant_profile=merchant_profile,
        help_with=help_with,
        rule=None,
    )
    db.add(ai_info)
    merchant_profile.ai_info = ai_info
    return ai_info