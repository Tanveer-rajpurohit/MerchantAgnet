import uuid
from decimal import Decimal
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.schemas.onboarding import OnboardingProductRow

async def get_by_id(
    db: AsyncSession,
    product_id: uuid.UUID | str,
    merchant_id: uuid.UUID | str,
) -> Product | None:
    p_id = uuid.UUID(str(product_id)) if isinstance(product_id, str) else product_id
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = select(Product).where(
        Product.id == p_id,
        Product.merchant_id == m_id,
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_by_merchant(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
    active_only: bool = True,
) -> list[Product]:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = select(Product).where(Product.merchant_id == m_id)
    if active_only:
        query = query.where(Product.is_active.is_(True))
    result = await db.execute(query)
    return list(result.scalars().all())

async def create_product(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    product_name: str,
    cost_price: Decimal,
    selling_price: Decimal,
    current_stock: int = 0,
    low_stock_alert: int = 0,
) -> Product:
    product = Product(
        merchant_id=merchant_id,
        product_name=product_name.strip(),
        cost_price=cost_price,
        selling_price=selling_price,
        current_stock=current_stock,
        low_stock_alert=low_stock_alert,
        is_active=True,
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return product

async def bulk_replace_products(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    products: list[OnboardingProductRow],
    skip_inventory: bool,
) -> int:
    await db.execute(
        delete(Product).where(Product.merchant_id == merchant_id)
    )

    count = 0
    if not skip_inventory:
        for item in products:
            if not item.product_name.strip():
                continue
            product = Product(
                merchant_id=merchant_id,
                product_name=item.product_name.strip(),
                cost_price=item.cost_price,
                selling_price=item.selling_price,
                current_stock=item.current_stock,
                low_stock_alert=item.low_stock_alert,
                is_active=True,
            )
            db.add(product)
            count += 1

    await db.flush()
    return count

async def delete_product(
    db: AsyncSession,
    product: Product,
) -> None:
    await db.delete(product)
    await db.flush()
