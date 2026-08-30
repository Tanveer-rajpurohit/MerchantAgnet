from fastapi import HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
)
from app.core.google_auth import verify_google_id_token
from app.core.rate_limiter import check_rate_limit, check_is_locked_out
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    AuthTokensResponse,
    AccessTokenResponse,
)

async def _create_session_tokens(redis: Redis, user: User) -> AuthTokensResponse:
    user_id_str = str(user.id)
    access_token = create_access_token(
        user_id=user_id_str,
        role=user.role.value,
    )
    refresh_token = generate_refresh_token()
    ttl_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400

    await redis.set(
        f"refresh_token:{refresh_token}",
        user_id_str,
        ex=ttl_seconds,
    )

    return AuthTokensResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

async def register_user(
    db: AsyncSession,
    redis: Redis,
    payload: RegisterRequest,
) -> AuthTokensResponse:
    if await user_repository.get_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    user = await user_repository.create_user(
        db=db,
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=None,
        role=payload.role,
    )

    return await _create_session_tokens(redis, user)

async def login_user(
    db: AsyncSession,
    redis: Redis,
    payload: LoginRequest,
) -> AuthTokensResponse:
    email_key = payload.email.strip().lower()
    failed_key = f"failed_logins:email:{email_key}"

    await check_is_locked_out(
        redis=redis,
        key=failed_key,
        limit=10,
        window_seconds=300,
        lockout_message="Too many failed login attempts. Please wait 5 minutes.",
    )

    user = await user_repository.get_by_email(db, payload.email)

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        try:
            await check_rate_limit(
                redis=redis,
                key=failed_key,
                limit=10,
                window_seconds=300,
                custom_message="Too many failed login attempts. Please wait 5 minutes.",
            )
        except HTTPException:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Please wait 5 minutes.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    await redis.delete(failed_key)
    return await _create_session_tokens(redis, user)

async def google_login_user(
    db: AsyncSession,
    redis: Redis,
    payload: GoogleAuthRequest,
) -> AuthTokensResponse:
    google_user = verify_google_id_token(payload.id_token)
    user = await user_repository.get_by_google_id(db, google_user.google_id)

    if user is None:
        user = await user_repository.get_by_email(db, google_user.email)
        if user is not None:
            user = await user_repository.link_google_id(
                db=db,
                user=user,
                google_id=google_user.google_id,
                profile_picture=google_user.picture,
            )
        else:
            user = await user_repository.create_google_user(
                db=db,
                full_name=google_user.full_name,
                email=google_user.email,
                google_id=google_user.google_id,
                profile_picture=google_user.picture,
                role=payload.role,
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    return await _create_session_tokens(redis, user)

async def verify_and_refresh_access_token(
    db: AsyncSession,
    redis: Redis,
    payload: RefreshTokenRequest,
) -> AccessTokenResponse:
    redis_key = f"refresh_token:{payload.refresh_token}"
    user_id = await redis.get(redis_key)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user = await user_repository.get_by_id(db, user_id)
    if not user:
        await redis.delete(redis_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists",
        )

    if not user.is_active:
        await redis.delete(redis_key)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    new_access_token = create_access_token(
        user_id=str(user.id),
        role=user.role.value,
    )

    return AccessTokenResponse(
        access_token=new_access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

async def logout_user(
    redis: Redis,
    payload: RefreshTokenRequest,
) -> None:
    await redis.delete(f"refresh_token:{payload.refresh_token}")