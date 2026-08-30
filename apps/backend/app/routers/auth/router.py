from fastapi import APIRouter, Depends, Request, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.redis import get_redis
from app.dependencies import get_current_user
from app.models.user import User
from app.services import auth_service
from app.core.rate_limiter import check_rate_limit, get_client_ip
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    AuthTokensResponse,
    AccessTokenResponse,
    MessageResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post(
    "/register",
    response_model=AuthTokensResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    ip = get_client_ip(request)
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:register:ip:{ip}",
        limit=5,
        window_seconds=3600,
    )
    return await auth_service.register_user(db, redis, payload)

@router.post(
    "/login",
    response_model=AuthTokensResponse,
    status_code=status.HTTP_200_OK,
)
async def login(
    payload: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    ip = get_client_ip(request)
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:login:ip:{ip}",
        limit=10,
        window_seconds=60,
    )
    return await auth_service.login_user(db, redis, payload)

@router.post(
    "/google",
    response_model=AuthTokensResponse,
    status_code=status.HTTP_200_OK,
)
async def google_auth(
    payload: GoogleAuthRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    ip = get_client_ip(request)
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:google:ip:{ip}",
        limit=10,
        window_seconds=60,
    )
    return await auth_service.google_login_user(db, redis, payload)

@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    status_code=status.HTTP_200_OK,
)
async def refresh_token(
    payload: RefreshTokenRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    ip = get_client_ip(request)
    await check_rate_limit(
        redis=redis,
        key=f"rate_limit:refresh:ip:{ip}",
        limit=20,
        window_seconds=60,
    )
    return await auth_service.verify_and_refresh_access_token(db, redis, payload)

@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
)
async def logout(
    payload: RefreshTokenRequest,
    redis: Redis = Depends(get_redis),
):
    await auth_service.logout_user(redis, payload)
    return MessageResponse(message="Successfully logged out")

@router.get(
    "/me",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user