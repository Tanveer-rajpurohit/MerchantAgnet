from fastapi import APIRouter, Depends, UploadFile, File, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.redis import get_redis
from app.dependencies import get_current_user
from app.models.user import User
from app.services import profile_service
from app.core.rate_limiter import check_rate_limit
from app.schemas.profile import (
    ProfileResponse,
    UpdateProfileRequest,
    SettingsResponse,
    UpdateSettingsRequest,
    AvatarResponse,
)

router = APIRouter(prefix="/profile", tags=["Profile & Settings"])

@router.get(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    return await profile_service.get_profile(db, redis, current_user.id)

@router.put(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    return await profile_service.update_profile(db, redis, current_user.id, payload)

@router.post(
    "/avatar",
    response_model=AvatarResponse,
    status_code=status.HTTP_200_OK,
)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:avatar:user:{current_user.id}",
        limit=10,
        window_seconds=3600,
    )
    return await profile_service.update_avatar(db, current_user, file, redis)

@router.get(
    "/settings",
    response_model=SettingsResponse,
    status_code=status.HTTP_200_OK,
)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await profile_service.get_settings(db, current_user.id)

@router.put(
    "/settings",
    response_model=SettingsResponse,
    status_code=status.HTTP_200_OK,
)
async def update_settings(
    payload: UpdateSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    return await profile_service.update_settings(db, redis, current_user.id, payload)
