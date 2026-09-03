import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import product_repository
from app.schemas.product import ProductCreateRequest, ProductUpdateRequest, ProductResponse

from sqlalchemy import delete
from app.services import knowledge_service

async def list_products(db: AsyncSession, merchant_id: uuid.UUID) -> list[ProductResponse]:
    products = await product_repository.list_by_merchant(db, merchant_id)
    return [ProductResponse.model_validate(p) for p in products]

async def get_product_by_id(db: AsyncSession, merchant_id: uuid.UUID, product_id: uuid.UUID) -> ProductResponse:
    product = await product_repository.get_by_id(db, product_id, merchant_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponse.model_validate(product)

async def create_product(db: AsyncSession, merchant_id: uuid.UUID, payload: ProductCreateRequest) -> ProductResponse:
    product = await product_repository.create_product(
        db=db,
        merchant_id=merchant_id,
        product_name=payload.product_name,
        cost_price=payload.cost_price,
        selling_price=payload.selling_price,
        current_stock=payload.current_stock,
        low_stock_alert=payload.low_stock_alert,
    )
    await knowledge_service.index_product(db, merchant_id, product)
    return ProductResponse.model_validate(product)

async def update_product(db: AsyncSession, merchant_id: uuid.UUID, product_id: uuid.UUID, payload: ProductUpdateRequest) -> ProductResponse:
    product = await product_repository.get_by_id(db, product_id, merchant_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.flush()
    await db.refresh(product)
    await knowledge_service.index_product(db, merchant_id, product)
    return ProductResponse.model_validate(product)

async def delete_product(db: AsyncSession, merchant_id: uuid.UUID, product_id: uuid.UUID) -> None:
    product = await product_repository.get_by_id(db, product_id, merchant_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    from app.models.knowledge_chunk import KnowledgeChunk
    await db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.source_id == product_id))
    await product_repository.delete_product(db, product)