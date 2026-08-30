from fastapi import APIRouter, Depends, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.redis import get_redis
from app.dependencies import get_current_user
from app.models.user import User
from app.services import onboarding_service
from app.core.rate_limiter import check_rate_limit
from app.schemas.onboarding import (
    OnboardingProfileRequest,
    OnboardingExpensesRequest,
    OnboardingProductsRequest,
    OnboardingCompleteRequest,
    OnboardingStepResponse,
)

router = APIRouter(prefix="/onboarding", tags=["Merchant Onboarding"])

@router.put(
    "/profile",
    response_model=OnboardingStepResponse,
    status_code=status.HTTP_200_OK,
)
async def save_profile_step(
    payload: OnboardingProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:onboarding:profile:{current_user.id}",
        limit=30,
        window_seconds=60,
    )
    return await onboarding_service.save_onboarding_profile(
        db,
        current_user.id,
        payload,
    )

@router.put(
    "/expenses",
    response_model=OnboardingStepResponse,
    status_code=status.HTTP_200_OK,
)
async def save_expenses_step(
    payload: OnboardingExpensesRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:onboarding:expenses:{current_user.id}",
        limit=30,
        window_seconds=60,
    )
    return await onboarding_service.save_onboarding_expenses(
        db,
        current_user.id,
        payload,
    )

@router.put(
    "/products",
    response_model=OnboardingStepResponse,
    status_code=status.HTTP_200_OK,
)
async def save_products_step(
    payload: OnboardingProductsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:onboarding:products:{current_user.id}",
        limit=30,
        window_seconds=60,
    )
    return await onboarding_service.save_onboarding_products(
        db,
        current_user.id,
        payload,
    )

@router.post(
    "/complete",
    response_model=OnboardingStepResponse,
    status_code=status.HTTP_200_OK,
)
async def complete_onboarding_step(
    payload: OnboardingCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:onboarding:complete:{current_user.id}",
        limit=10,
        window_seconds=60,
    )
    return await onboarding_service.complete_onboarding(
        db,
        redis,
        current_user.id,
        payload,
    )
