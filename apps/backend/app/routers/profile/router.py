from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import profile_service
from app.schemas.profile import (
    ProfileResponse,
    UpdateProfileRequest,
    SettingsResponse,
    UpdateSettingsRequest,
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
):
    return await profile_service.get_profile(db, current_user.id)

@router.put(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_200_OK,
)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await profile_service.update_profile(db, current_user.id, payload)

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
):
    return await profile_service.update_settings(db, current_user.id, payload)
