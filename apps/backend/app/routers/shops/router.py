import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_optional_current_user, rate_limit_public_shops
from app.models.user import User
from app.services import shop_service
from app.schemas.shop import ShopDetail, PaginatedShopResponse

router = APIRouter(prefix="/shops", tags=["Shops"])

@router.get(
    "",
    response_model=PaginatedShopResponse,
    dependencies=[Depends(rate_limit_public_shops)],
)
async def list_shops(
    search: str | None = Query(None),
    category: str | None = Query(None),
    cursor: datetime | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await shop_service.list_shops(
        db=db,
        search=search,
        category=category,
        cursor=cursor,
        limit=limit,
    )

@router.get(
    "/{merchant_id}",
    response_model=ShopDetail,
    dependencies=[Depends(rate_limit_public_shops)],
)
async def get_shop(
    merchant_id: uuid.UUID,
    current_user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await shop_service.get_shop_detail(
        db=db,
        merchant_id=merchant_id,
        current_user=current_user,
    )
