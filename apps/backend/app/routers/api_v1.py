from fastapi import APIRouter
from app.routers.auth.router import router as auth_router
from app.routers.profile.router import router as profile_router
from app.routers.onboarding.router import router as onboarding_router
from app.routers.health.router import router as health_router
from app.routers.products.router import router as products_router
from app.routers.expenses.router import router as expenses_router
from app.routers.customers.router import router as customers_router
from app.routers.orders.router import router as orders_router
from app.routers.shops.router import router as shops_router
from app.routers.messages.router import router as messages_router
from app.routers.merchants.razorpay_router import router as razorpay_router
from app.routers.payment_links.router import router as payment_links_router
from app.routers.payouts.router import router as payouts_router
from app.routers.audit_logs.router import router as audit_logs_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profile_router)
api_v1_router.include_router(onboarding_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(products_router)
api_v1_router.include_router(expenses_router)
api_v1_router.include_router(customers_router)
api_v1_router.include_router(orders_router)
api_v1_router.include_router(shops_router)
api_v1_router.include_router(messages_router)
api_v1_router.include_router(razorpay_router)
api_v1_router.include_router(payment_links_router)
api_v1_router.include_router(payouts_router)
api_v1_router.include_router(audit_logs_router)