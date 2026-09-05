import logging
import uuid
from decimal import Decimal

from sqlalchemy import select
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.product import Product
from app.services.knowledge_service import search_catalog_chunks, index_product, delete_product_chunk
from app.repositories import audit_log_repository, product_repository
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant, _is_merchant

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def get_product_catalog(
    ctx: RunContext[MerchantAgentDeps],
    search_term: str | None = None,
) -> str:
    """Retrieve the store's product catalog or search for specific products.

    Call this whenever the merchant asks about inventory, stock levels, product prices, or available items.
    Pass search_term to filter by product name, or leave empty / 'all' to list all products.
    For merchants, returns selling price, cost price, current stock, and product IDs.
    """
    try:
        merchant_id = _merchant_id(ctx)
        is_merchant = _is_merchant(ctx)

        # For customers: STRICT SECURITY GUARD.
        # NEVER return cost price, internal IDs, or low stock alerts.
        # NEVER return raw chunks that may contain cost prices.
        if not is_merchant:
            stmt = select(Product).where(
                Product.merchant_id == merchant_id,
                Product.is_active.is_(True),
            )
            if search_term and search_term.lower().strip() not in ("all", "all products", "inventory", "catalog", "everything"):
                stmt = stmt.where(Product.product_name.ilike(f"%{search_term.strip()}%"))
            stmt = stmt.order_by(Product.product_name.asc()).limit(30)

            products = (await ctx.deps.db.execute(stmt)).scalars().all()
            if not products and search_term:
                all_stmt = select(Product).where(
                    Product.merchant_id == merchant_id,
                    Product.is_active.is_(True),
                ).order_by(Product.product_name.asc()).limit(30)
                products = (await ctx.deps.db.execute(all_stmt)).scalars().all()

            if products:
                lines = [
                    "| Product | Price | Stock |",
                    "| :--- | :--- | :--- |",
                ]
                for p in products:
                    stock_desc = f"{p.current_stock} available" if p.current_stock > 0 else "Out of stock"
                    lines.append(f"| {p.product_name} | ₹{p.selling_price:.2f} | {stock_desc} |")
                return "\n".join(lines)

            return "No products are currently available in the catalog."

        # For merchants: Full operational visibility with direct table query
        stmt = select(Product).where(Product.merchant_id == merchant_id)
        if search_term and search_term.lower().strip() not in (
            "all", "all products", "inventory", "catalog", "everything",
            "my product", "products", "list", "list of my product", "list of products",
        ):
            stmt = stmt.where(Product.product_name.ilike(f"%{search_term.strip()}%"))
        stmt = stmt.order_by(Product.product_name.asc()).limit(50)

        products = (await ctx.deps.db.execute(stmt)).scalars().all()
        if not products and search_term:
            all_stmt = (
                select(Product)
                .where(Product.merchant_id == merchant_id)
                .order_by(Product.product_name.asc())
                .limit(50)
            )
            products = (await ctx.deps.db.execute(all_stmt)).scalars().all()

        if products:
            lines = [
                "| Product | Selling Price | Cost Price | Margin | Stock | Status |",
                "| :--- | :--- | :--- | :--- | :--- | :--- |",
            ]
            for p in products:
                margin = p.selling_price - p.cost_price
                threshold = p.low_stock_alert or 5
                if p.current_stock <= 0:
                    status = "Out of Stock"
                elif p.current_stock <= threshold:
                    status = "Low Stock"
                else:
                    status = "Healthy Stock"
                lines.append(
                    f"| {p.product_name} | ₹{p.selling_price:.2f} | ₹{p.cost_price:.2f} | ₹{margin:.2f} | {p.current_stock} units | {status} |"
                )
            return "\n".join(lines)

        return "Catalog is empty. No products configured for this store yet."
    except Exception as e:
        logger.error("Error in get_product_catalog: %s", e, exc_info=True)
        return f"Error retrieving catalog: {str(e)}"


@merchant_agent.tool
async def search_store_knowledge(
    ctx: RunContext[MerchantAgentDeps],
    query: str,
) -> str:
    """Semantically search store records, vendor policies, wholesale terms, supplier contacts, and store guidelines."""
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        results = await search_catalog_chunks(
            db=ctx.deps.db,
            merchant_id=_merchant_id(ctx),
            query=query,
            limit=5,
        )
        if results:
            return "\n".join(results)
        return "No specific store knowledge or vendor policy chunks found for this query."
    except Exception as e:
        logger.error("Error in search_store_knowledge: %s", e, exc_info=True)
        return f"Error searching store knowledge: {str(e)}"


@merchant_agent.tool
async def add_product(
    ctx: RunContext[MerchantAgentDeps],
    product_name: str,
    cost_price: float,
    selling_price: float,
    current_stock: int = 0,
    low_stock_alert: int = 5,
) -> str:
    """Add a new product to the catalog. Use this when the merchant mentions a new item."""
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        product = await product_repository.create_product(
            db=ctx.deps.db,
            merchant_id=_merchant_id(ctx),
            product_name=product_name,
            cost_price=Decimal(str(cost_price)),
            selling_price=Decimal(str(selling_price)),
            current_stock=int(current_stock),
            low_stock_alert=int(low_stock_alert),
        )

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="product.created",
            entity_type="product",
            entity_id=str(product.id),
            merchant_id=_merchant_id(ctx),
            user_id=_actor_user_id(ctx),
            details={"name": product.product_name, "selling_price": str(product.selling_price)},
        )
        await index_product(db=ctx.deps.db, merchant_id=_merchant_id(ctx), product=product)
        await ctx.deps.db.commit()

        return (
            f"Product added.\n"
            f"PRODUCT_ID: {product.id}\n"
            f"Name: {product.product_name}\n"
            f"Cost Price: ₹{product.cost_price:.2f}\n"
            f"Selling Price: ₹{product.selling_price:.2f}\n"
            f"Stock: {product.current_stock} | Low Stock Alert: {product.low_stock_alert}"
        )
    except Exception as e:
        logger.error("Error in add_product: %s", e, exc_info=True)
        return f"Failed to add product: {str(e)}"


@merchant_agent.tool
async def update_product(
    ctx: RunContext[MerchantAgentDeps],
    product_name: str | None = None,
    product_id: str | None = None,
    cost_price: float | None = None,
    selling_price: float | None = None,
    price: float | None = None,
    current_stock: int | None = None,
    stock: int | None = None,
    new_product_name: str | None = None,
    new_name: str | None = None,
    low_stock_alert: int | None = None,
) -> str:
    """Edit an existing product. Only the fields you pass will change (partial update).
    You can pass `product_name` (e.g. "toast", "amul butter") or `product_id`.
    NEVER ask the merchant for a UUID product_id — look it up by product_name.
    You may update name, prices, stock, or low-stock alert.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)
        product = None

        if selling_price is None and price is not None:
            selling_price = price
        if current_stock is None and stock is not None:
            current_stock = stock
        rename_to = new_product_name or new_name

        # 1. Try resolving by product_id if provided
        if product_id:
            try:
                pid = uuid.UUID(str(product_id).strip())
                product = await product_repository.get_by_id(ctx.deps.db, pid, merchant_id)
            except (ValueError, AttributeError):
                if not product_name:
                    product_name = str(product_id).strip()

        # 2. If product not found yet and product_name is provided, search by name
        if not product and product_name:
            target = product_name.strip()
            stmt = (
                select(Product)
                .where(
                    Product.merchant_id == merchant_id,
                    Product.is_active.is_(True),
                    Product.product_name.ilike(target),
                )
                .limit(1)
            )
            product = (await ctx.deps.db.execute(stmt)).scalars().first()

            if not product:
                stmt = (
                    select(Product)
                    .where(
                        Product.merchant_id == merchant_id,
                        Product.is_active.is_(True),
                        Product.product_name.ilike(f"%{target}%"),
                    )
                    .limit(1)
                )
                product = (await ctx.deps.db.execute(stmt)).scalars().first()

        if not product:
            if selling_price is not None:
                target_name = (product_name or product_id or "Item").strip()
                cost = Decimal(str(cost_price)) if cost_price is not None else Decimal(str(selling_price)) * Decimal("0.8")
                new_p = await product_repository.create_product(
                    db=ctx.deps.db,
                    merchant_id=merchant_id,
                    product_name=target_name,
                    cost_price=cost,
                    selling_price=Decimal(str(selling_price)),
                    current_stock=int(current_stock or 0),
                    low_stock_alert=int(low_stock_alert or 5),
                )
                await index_product(db=ctx.deps.db, merchant_id=merchant_id, product=new_p)
                await ctx.deps.db.commit()
                return (
                    f"Product added.\n"
                    f"PRODUCT_ID: {new_p.id}\n"
                    f"Name: {new_p.product_name}\n"
                    f"Selling Price: ₹{new_p.selling_price:.2f}\n"
                    f"Stock: {new_p.current_stock} | Low Stock Alert: {new_p.low_stock_alert}"
                )

            ident = product_name or product_id or "unknown"
            return (
                f"Product '{ident}' not found in catalog. "
                f"Call get_product_catalog to check available products, or add it with add_product."
            )

        before = {
            "name": product.product_name,
            "cost_price": str(product.cost_price),
            "selling_price": str(product.selling_price),
            "stock": product.current_stock,
            "low_stock_alert": product.low_stock_alert,
        }
        if rename_to:
            product.product_name = rename_to.strip()
        elif product_name is not None and product_id and str(product_id).strip() != product_name.strip():
            product.product_name = product_name.strip()
        if cost_price is not None:
            product.cost_price = Decimal(str(cost_price))
        if selling_price is not None:
            product.selling_price = Decimal(str(selling_price))
        if current_stock is not None:
            product.current_stock = int(current_stock)
        if low_stock_alert is not None:
            product.low_stock_alert = int(low_stock_alert)
        await ctx.deps.db.flush()

        # Sync RAG knowledge chunk selectively for this product
        await index_product(db=ctx.deps.db, merchant_id=merchant_id, product=product)

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="product.updated",
            entity_type="product",
            entity_id=str(product.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={"before": before, "after": {
                "name": product.product_name,
                "cost_price": str(product.cost_price),
                "selling_price": str(product.selling_price),
                "stock": product.current_stock,
                "low_stock_alert": product.low_stock_alert,
            }},
        )
        await ctx.deps.db.commit()

        return (
            f"Product updated.\n"
            f"PRODUCT_ID: {product.id}\n"
            f"Name: {product.product_name}\n"
            f"Cost Price: ₹{product.cost_price:.2f}\n"
            f"Selling Price: ₹{product.selling_price:.2f}\n"
            f"Stock: {product.current_stock} | Low Stock Alert: {product.low_stock_alert}"
        )
    except Exception as e:
        logger.error("Error in update_product: %s", e, exc_info=True)
        return f"Failed to update product: {str(e)}"


@merchant_agent.tool
async def delete_product(
    ctx: RunContext[MerchantAgentDeps],
    product_name: str | None = None,
    product_id: str | None = None,
) -> str:
    """Delete a product from the catalog. You can pass `product_name` or `product_id`.
    NEVER ask the merchant for a UUID.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)
        product = None

        if product_id:
            try:
                pid = uuid.UUID(str(product_id).strip())
                product = await product_repository.get_by_id(ctx.deps.db, pid, merchant_id)
            except (ValueError, AttributeError):
                if not product_name:
                    product_name = str(product_id).strip()

        if not product and product_name:
            target = product_name.strip()
            stmt = (
                select(Product)
                .where(
                    Product.merchant_id == merchant_id,
                    Product.is_active.is_(True),
                    Product.product_name.ilike(target),
                )
                .limit(1)
            )
            product = (await ctx.deps.db.execute(stmt)).scalars().first()
            if not product:
                stmt = (
                    select(Product)
                    .where(
                        Product.merchant_id == merchant_id,
                        Product.is_active.is_(True),
                        Product.product_name.ilike(f"%{target}%"),
                    )
                    .limit(1)
                )
                product = (await ctx.deps.db.execute(stmt)).scalars().first()

        if not product:
            ident = product_name or product_id or "unknown"
            return f"Product '{ident}' not found."

        snapshot = {"name": product.product_name, "selling_price": str(product.selling_price)}
        prod_id = product.id
        await delete_product_chunk(ctx.deps.db, merchant_id, prod_id)
        await product_repository.delete_product(ctx.deps.db, product)

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="product.deleted",
            entity_type="product",
            entity_id=str(prod_id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details=snapshot,
        )
        await ctx.deps.db.commit()
        return f"Product {snapshot['name']} (ID: {prod_id}) deleted."
    except Exception as e:
        logger.error("Error in delete_product: %s", e, exc_info=True)
        return f"Failed to delete product: {str(e)}"
