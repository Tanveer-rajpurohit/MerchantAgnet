from contextlib import asynccontextmanager
import asyncio
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine
from app.db.redis import init_redis_pool, close_redis_pool
from app.routers.api_v1 import api_v1_router
from app.routers.health.router import router as root_health_router
from app.routers.websockets.router import router as websocket_router

logger = logging.getLogger(__name__)

async def _prewarm_embedding_model():
    """Pre-warm the fastembed ONNX model in a background thread so the first
    chat request doesn't pay the 10-30s cold-start penalty.

    The model is loaded lazily on first call; we trigger that load here in a
    background thread so the app accepts requests immediately while the model
    loads. By the time the merchant sends their first chat, the model is ready.
    """
    try:
        def _load():
            from app.services.embedding_service import prewarm_embedding_model
            prewarm_embedding_model()
            logger.info("Embedding model loaded and pre-warmed")
        await asyncio.get_event_loop().run_in_executor(None, _load)
    except Exception as e:
        logger.warning("Embedding pre-warm failed (will retry on first chat): %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))

    redis = await init_redis_pool()
    await redis.ping()

    asyncio.create_task(_prewarm_embedding_model())

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