import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.merchant_profile import MerchantProfile
from app.repositories import shop_repository
from app.schemas.product import ProductResponse
from app.schemas.shop import (
    ShopAddressResponse,
    ShopListItem,
    ShopDetail,
    PaginatedShopResponse,
)

def to_list_item(merchant: MerchantProfile) -> ShopListItem:
    user = merchant.user
    addresses = user.addresses if user and user.addresses else []
    primary_addr = next((a for a in addresses if a.is_default), addresses[0] if addresses else None)

    address_dto = None
    city = None
    area = None

    if primary_addr:
        address_dto = ShopAddressResponse(
            line1=primary_addr.line1,
            line2=primary_addr.line2,
            landmark=primary_addr.landmark,
            city=primary_addr.city,
            state=primary_addr.state,
            pincode=primary_addr.pincode,
        )
        city = primary_addr.city
        area = primary_addr.landmark or primary_addr.line1

    popular = [p.product_name for p in merchant.products if p.is_active][:5] if merchant.products else []

    return ShopListItem(
        id=merchant.id,
        business_name=merchant.business_name,
        business_type=merchant.business_type,
        owner_name=user.full_name if user else "Merchant",
        owner_phone=user.phone_number if user else None,
        city=city,
        area=area,
        address=address_dto,
        popular_products=popular,
        created_at=merchant.created_at,
    )

async def list_shops(
    db: AsyncSession,
    search: str | None = None,
    category: str | None = None,
    cursor: datetime | None = None,
    limit: int = 20,
) -> PaginatedShopResponse:
    merchants = await shop_repository.list_shops(
        db=db,
        search=search,
        category=category,
        cursor=cursor,
        limit=limit,
    )
    has_more = len(merchants) > limit
    items = merchants[:limit]
    next_cursor = items[-1].created_at if has_more and items else None

    return PaginatedShopResponse(
        items=[to_list_item(m) for m in items],
        next_cursor=next_cursor,
        has_more=has_more,
    )

async def get_shop_detail(
    db: AsyncSession,
    merchant_id: uuid.UUID,
) -> ShopDetail:
    merchant = await shop_repository.get_by_id(db, merchant_id)
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop not found",
        )

    list_item = to_list_item(merchant)
    active_products = [
        ProductResponse.model_validate(p)
        for p in (merchant.products or [])
        if p.is_active
    ]

    return ShopDetail(
        **list_item.model_dump(),
        business_description=merchant.business_description,
        upi_vpa=merchant.upi_vpa,
        preferred_language=merchant.preferred_language,
        products=active_products,
    )
