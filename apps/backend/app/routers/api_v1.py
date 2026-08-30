from fastapi import APIRouter
from app.routers.auth.router import router as auth_router
from app.routers.profile.router import router as profile_router
from app.routers.onboarding.router import router as onboarding_router
from app.routers.health.router import router as health_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(onboarding_router)
api_v1_router.include_router(health_router)
