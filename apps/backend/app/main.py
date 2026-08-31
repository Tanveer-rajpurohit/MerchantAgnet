from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine
from app.db.redis import init_redis_pool, close_redis_pool
from app.routers.api_v1 import api_v1_router
from app.routers.health.router import router as root_health_router
from app.routers.websockets.router import router as websocket_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

    redis = await init_redis_pool()
    await redis.ping()

    yield

    await engine.dispose()
    await close_redis_pool()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root_health_router)
app.include_router(api_v1_router)
app.include_router(websocket_router)