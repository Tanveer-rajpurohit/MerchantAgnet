import time
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.redis import redis_client, init_redis_pool
from app.core.security import decode_access_token
from app.repositories import user_repository
from app.models.user import User, UserRole

security_scheme = HTTPBearer(auto_error=True)
optional_security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repository.get_by_id(db, payload["sub"])
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user

async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(optional_security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        return None
    user = await user_repository.get_by_id(db, payload["sub"])
    if user is None or not user.is_active:
        return None
    return user

async def get_current_merchant(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.merchant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to merchants only",
        )
    return current_user

async def get_current_customer(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.customer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to customers only",
        )
    return current_user

async def rate_limit_public_shops(
    request: Request,
    current_user: User | None = Depends(get_optional_current_user),
) -> None:
    if current_user is not None:
        return

    client = redis_client
    if client is None:
        client = await init_redis_pool()

    client_ip = request.client.host if request.client else "unknown"
    minute_bucket = int(time.time() // 60)

    ip_key = f"rate_limit:shops:ip:{client_ip}:{minute_bucket}"
    global_key = f"rate_limit:shops:global:{minute_bucket}"

    pipe = client.pipeline()
    pipe.incr(ip_key)
    pipe.expire(ip_key, 70)
    pipe.incr(global_key)
    pipe.expire(global_key, 70)
    ip_count, _, global_count, _ = await pipe.execute()

    if ip_count > 60 or global_count > 500:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Public traffic limit reached. Please log in for unlimited access.",
            headers={"Retry-After": "60"},
        )