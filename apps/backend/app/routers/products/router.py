import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import product_service
from app.schemas.product import ProductCreateRequest, ProductUpdateRequest, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get(
    "",
    response_model=list[ProductResponse],
)
async def list_products(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access products")
    return await product_service.list_products(db, current_user.merchant_profile.id)

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
async def get_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access products")
    return await product_service.get_product_by_id(db, current_user.merchant_profile.id, product_id)

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_product(
    payload: ProductCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access products")
    return await product_service.create_product(db, current_user.merchant_profile.id, payload)

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
)
async def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access products")
    return await product_service.update_product(db, current_user.merchant_profile.id, product_id, payload)

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access products")
    await product_service.delete_product(db, current_user.merchant_profile.id, product_id)