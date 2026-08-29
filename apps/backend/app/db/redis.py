from collections.abc import AsyncGenerator
from redis.asyncio import Redis, from_url
from app.core.config import settings

redis_client: Redis | None = None

async def init_redis_pool() -> Redis:
    global redis_client
    if redis_client is None:
        redis_client = from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return redis_client

async def close_redis_pool() -> None:
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None

async def get_redis() -> AsyncGenerator[Redis, None]:
    if redis_client is None:
        await init_redis_pool()
    assert redis_client is not None
    yield redis_client
