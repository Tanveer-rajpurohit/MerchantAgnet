import time
from fastapi import Request, HTTPException, status
from redis.asyncio import Redis

LUA_SLIDING_WINDOW_SCRIPT = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clear_before = now - window

redis.call("ZREMRANGEBYSCORE", key, 0, clear_before)
local current_count = redis.call("ZCARD", key)

if current_count < limit then
    redis.call("ZADD", key, now, tostring(now))
    redis.call("PEXPIRE", key, window)
    return {1, limit - current_count - 1}
else
    return {0, 0}
end
"""

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"

async def check_rate_limit(
    redis: Redis,
    key: str,
    limit: int,
    window_seconds: int,
) -> None:
    now_ms = int(time.time() * 1000)
    window_ms = window_seconds * 1000

    result = await redis.eval(
        LUA_SLIDING_WINDOW_SCRIPT,
        1,
        key,
        now_ms,
        window_ms,
        limit,
    )
    allowed = bool(result[0])
    remaining = int(result[1])

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please slow down and try again.",
            headers={
                "Retry-After": str(window_seconds),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
            },
        )