import uuid
from fastapi import HTTPException, UploadFile, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.s3 import upload_file_to_s3
from app.models.user import User
from app.repositories import profile_repository
from app.schemas.profile import (
    AddressDTO,
    MerchantProfileDTO,
    AIInfoDTO,
    SettingsResponse,
    ProfileResponse,
    UpdateProfileRequest,
    UpdateSettingsRequest,
    AvatarResponse,
)

def _build_profile_response(user: User) -> ProfileResponse:
    address_dto: AddressDTO | None = None
    for addr in user.addresses:
        if addr.is_default or True:
            address_dto = AddressDTO(
                line1=addr.line1 or None,
                line2=addr.line2,
                landmark=addr.landmark,
                city=addr.city or None,
                state=addr.state or None,
                pincode=addr.pincode or None,
                country=addr.country,
            )
            break

    merchant_dto: MerchantProfileDTO | None = None
    if user.merchant_profile is not None:
        mp = user.merchant_profile
        merchant_dto = MerchantProfileDTO(
            business_name=mp.business_name,
            business_type=mp.business_type,
            business_description=mp.business_description,
            gstin=mp.gstin,
            upi_vpa=mp.upi_vpa,
            preferred_language=mp.preferred_language,
            is_razorpay_active=mp.is_razorpay_active,
        )

    settings_dto: SettingsResponse | None = None
    ai_dto: AIInfoDTO | None = None
    if user.merchant_profile and user.merchant_profile.ai_info:
        ai_dto = AIInfoDTO(
            help_with=user.merchant_profile.ai_info.help_with,
            rule=user.merchant_profile.ai_info.rule,
        )

    if user.settings is not None:
        settings_dto = SettingsResponse(
            show_mobile_number=user.settings.show_mobile_number,
            show_email=user.settings.show_email,
            ai_info=ai_dto,
        )
    else:
        settings_dto = SettingsResponse(ai_info=ai_dto)

    return ProfileResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        profile_picture=user.profile_picture,
        role=user.role.value,
        merchant_profile=merchant_dto,
        address=address_dto,
        settings=settings_dto,
    )

async def get_profile(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
) -> ProfileResponse:
    cache_key = f"profile:{user_id}"
    cached_data = await redis.get(cache_key)
    if cached_data:
        return ProfileResponse.model_validate_json(cached_data)

    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profile_response = _build_profile_response(user)
    await redis.set(cache_key, profile_response.model_dump_json(), ex=3600)
    return profile_response

async def update_profile(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: UpdateProfileRequest,
) -> ProfileResponse:
    user = await profile_repository.get_user_with_relations(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if payload.full_name is not None and payload.full_name.strip():
        user.full_name = payload.full_name.strip()
    if payload.phone_number is not None:
        user.phone_number = payload.phone_number.strip() if payload.phone_number.strip() else None

    if any(
        x is not None
        for x in [
            payload.business_name,
            payload.business_type,
            payload.business_description,
            payload.gstin,
            payload.upi_vpa,
            payload.preferred_language,
        ]
    ):
        mp = profile_repository.get_or_create_merchant_profile(db, user)
        if payload.business_name is not None:
            mp.business_name = payload.business_name.strip()
        if payload.business_type is not None:
            mp.business_type = payload.business_type.strip()
        if payload.business_description is not None:
            mp.business_description = payload.business_description.strip() if payload.business_description.strip() else None
        if payload.gstin is not None:
            mp.gstin = payload.gstin.strip().upper() if payload.gstin.strip() else None
        if payload.upi_vpa is not None:
            mp.upi_vpa = payload.upi_vpa.strip().lower() if payload.upi_vpa.strip() else None
        if payload.preferred_language is not None:
            mp.preferred_language = payload.preferred_language.strip()

    if payload.address is not None:
        addr = profile_repository.get_or_create_default_address(db, user)
        if payload.address.line1 is not None:
            addr.line1 = payload.address.line1.strip()
        if payload.address.line2 is not None:
            addr.line2 = payload.address.line2.strip()
        if payload.address.landmark is not None:
            addr.landmark = payload.address.landmark.strip()
        if payload.address.city is not None:
            addr.city = payload.address.city.strip()
        if payload.address.state is not None:
            addr.state = payload.address.state.strip()
        if payload.address.pincode is not None:
            addr.pincode = payload.address.pincode.strip()

    await db.flush()
    refreshed_user = await profile_repository.get_user_with_relations(db, user_id)
    if not refreshed_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profile_response = _build_profile_response(refreshed_user)
    cache_key = f"profile:{user_id}"
    await redis.set(cache_key, profile_response.model_dump_json(), ex=3600)
    return profile_response

async def update_avatar(
    db: AsyncSession,
    user: User,
    file: UploadFile,
    redis: Redis,
) -> AvatarResponse:
    avatar_url = await upload_file_to_s3(file, user.id)
    user.profile_picture = avatar_url

    await db.flush()

    cache_key = f"profile:{user.id}"
    await redis.delete(cache_key)

    return AvatarResponse(
        avatar_url=avatar_url,
        message="Avatar updated successfully",
    )

async def get_settings(
    db: AsyncSession,
    user_id: uuid.UUID,
) -> SettingsResponse:
    user = await profile_repository.get_user_with_settings(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    ai_dto: AIInfoDTO | None = None
    if user.merchant_profile and user.merchant_profile.ai_info:
        ai_dto = AIInfoDTO(
            help_with=user.merchant_profile.ai_info.help_with,
            rule=user.merchant_profile.ai_info.rule,
        )

    show_mobile = user.settings.show_mobile_number if user.settings else True
    show_email = user.settings.show_email if user.settings else False

    return SettingsResponse(
        show_mobile_number=show_mobile,
        show_email=show_email,
        ai_info=ai_dto,
    )

async def update_settings(
    db: AsyncSession,
    redis: Redis,
    user_id: uuid.UUID,
    payload: UpdateSettingsRequest,
) -> SettingsResponse:
    user = await profile_repository.get_user_with_settings(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    settings = profile_repository.get_or_create_settings(db, user)

    if payload.show_mobile_number is not None:
        settings.show_mobile_number = payload.show_mobile_number
    if payload.show_email is not None:
        settings.show_email = payload.show_email

    ai_dto: AIInfoDTO | None = None
    if payload.ai_info is not None and user.merchant_profile:
        ai_info = profile_repository.update_or_create_ai_info(
            db=db,
            merchant_profile=user.merchant_profile,
            help_with=payload.ai_info.help_with,
            rule=payload.ai_info.rule,
        )
        ai_dto = AIInfoDTO(
            help_with=ai_info.help_with,
            rule=ai_info.rule,
        )
    elif user.merchant_profile and user.merchant_profile.ai_info:
        ai_dto = AIInfoDTO(
            help_with=user.merchant_profile.ai_info.help_with,
            rule=user.merchant_profile.ai_info.rule,
        )

    await db.flush()

    cache_key = f"profile:{user_id}"
    await redis.delete(cache_key)

    return SettingsResponse(
        show_mobile_number=settings.show_mobile_number,
        show_email=settings.show_email,
        ai_info=ai_dto,
    )