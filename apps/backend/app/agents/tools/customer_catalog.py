import logging
from sqlalchemy import select
from pydantic_ai import RunContext

from app.agents.customer_deps import CustomerAgentDeps
from app.models.product import Product

logger = logging.getLogger(__name__)


async def get_store_products(
    ctx: RunContext[CustomerAgentDeps],
    search_term: str | None = None,
) -> str:
    """Browse the store's product catalog. Returns product names, selling prices, and stock availability.
    Call this when a customer asks about products, prices, or what's available.
    Pass search_term to filter (e.g., "rice", "butter") or omit for all products.
    """
    try:
        stmt = select(Product).where(
            Product.merchant_id == ctx.deps.merchant_id,
            Product.is_active.is_(True),
        )
        if search_term and search_term.lower().strip() not in ("all", "all products", "catalog", "everything"):
            stmt = stmt.where(Product.product_name.ilike(f"%{search_term.strip()}%"))
        stmt = stmt.limit(25)

        products = (await ctx.deps.db.execute(stmt)).scalars().all()

        if not products and search_term:
            all_stmt = select(Product).where(
                Product.merchant_id == ctx.deps.merchant_id,
                Product.is_active.is_(True),
            ).limit(25)
            products = (await ctx.deps.db.execute(all_stmt)).scalars().all()

        if not products:
            return "No products are currently available in the store catalog."

        lines = [
            "| Product | Price | Stock |",
            "| :--- | :--- | :--- |",
        ]
        for p in products:
            stock_desc = f"{p.current_stock} available" if p.current_stock > 0 else "Out of stock"
            lines.append(f"| {p.product_name} | ₹{p.selling_price:.2f} | {stock_desc} |")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_store_products: %s", e, exc_info=True)
        return f"Error browsing catalog: {e}"
