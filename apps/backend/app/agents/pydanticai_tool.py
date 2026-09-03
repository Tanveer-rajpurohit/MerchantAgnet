import logging
from decimal import Decimal
from sqlalchemy import select
from pydantic_ai import RunContext
from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.services.knowledge_service import search_catalog_chunks
from app.models.address import Address
from app.models.product import Product
from app.models.expense import Expense

logger = logging.getLogger(__name__)

@merchant_agent.tool
async def get_product_catalog(
    ctx: RunContext[MerchantAgentDeps],
    search_term: str | None = None,
) -> str:
    """Retrieve the merchant's product catalog, live stock quantities, cost prices, and selling prices.
    Pass `search_term` to filter by a specific item or category, or omit it (None) to inspect all products."""
    try:
        query = search_term.strip() if search_term else "all products"
        
        # 1. Vector semantic search first
        results = await search_catalog_chunks(
            db=ctx.deps.db,
            merchant_id=ctx.deps.merchant.id,
            query=query,
            limit=20,
        )
        if results:
            return "\n".join(results)

        # 2. SQL direct query fallback
        stmt = select(Product).where(Product.merchant_id == ctx.deps.merchant.id)
        if search_term and search_term.lower() not in ("all", "all products", "inventory"):
            stmt = stmt.where(Product.name.ilike(f"%{search_term}%"))
        stmt = stmt.limit(25)

        products = (await ctx.deps.db.execute(stmt)).scalars().all()
        if not products and search_term:
            # If specific term returned nothing, fallback to listing all items
            all_stmt = select(Product).where(Product.merchant_id == ctx.deps.merchant.id).limit(25)
            products = (await ctx.deps.db.execute(all_stmt)).scalars().all()

        if products:
            lines = []
            for p in products:
                lines.append(
                    f"- {p.name}: Selling Price ₹{p.selling_price:.2f} | Cost Price ₹{p.cost_price:.2f} | Current Stock: {p.current_stock} units | Low Stock Threshold: {p.low_stock_threshold or 5}"
                )
            return "\n".join(lines)

        return "Catalog is empty. No products configured."
    except Exception as e:
        logger.error(f"Error in get_product_catalog: {e}", exc_info=True)
        return f"Error retrieving catalog: {str(e)}"

@merchant_agent.tool
async def search_catalog(ctx: RunContext[MerchantAgentDeps], query: str = "all products") -> str:
    """Search catalog items, prices, and inventory levels (alias for get_product_catalog)."""
    return await get_product_catalog(ctx, search_term=query)

@merchant_agent.tool
async def search_store_knowledge(ctx: RunContext[MerchantAgentDeps], query: str) -> str:
    """Semantically search store records, vendor policies, wholesale terms, supplier contacts, and store guidelines."""
    try:
        results = await search_catalog_chunks(
            db=ctx.deps.db,
            merchant_id=ctx.deps.merchant.id,
            query=query,
            limit=5,
        )
        if results:
            return "\n".join(results)
        return "No specific store knowledge or vendor policy chunks found for this query."
    except Exception as e:
        logger.error(f"Error in search_store_knowledge: {e}", exc_info=True)
        return f"Error searching store knowledge: {str(e)}"

@merchant_agent.tool
async def get_store_info(ctx: RunContext[MerchantAgentDeps], query: str = "store address and profile") -> str:
    """Look up verified merchant store details: physical store address, owner name, business phone, UPI ID, and business type."""
    try:
        sp = ctx.deps.store_profile
        if sp:
            return (
                f"STORE NAME: {sp.store_name}\n"
                f"CATEGORY: {sp.category}\n"
                f"STORE OWNER: {sp.owner_name}\n"
                f"DELIVERY ADDRESS: {sp.full_address}\n"
                f"CONTACT PHONE: {sp.phone}\n"
                f"CONTACT EMAIL: {sp.email}\n"
                f"ACCEPTED UPI VPA: {sp.upi_vpa or 'Not configured'}"
            )

        merchant = ctx.deps.merchant
        user = ctx.deps.user
        addr_stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
        addr = (await ctx.deps.db.execute(addr_stmt)).scalars().first()

        address_str = "Registered Store Address"
        if addr:
            parts = [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode]
            valid_parts = [p for p in parts if p and p.strip()]
            if valid_parts:
                address_str = ", ".join(valid_parts)

        return (
            f"STORE NAME: {merchant.business_name}\n"
            f"CATEGORY: {merchant.business_type}\n"
            f"STORE OWNER: {user.full_name or 'Store Owner'}\n"
            f"DELIVERY ADDRESS: {address_str}\n"
            f"CONTACT PHONE: {user.phone_number or 'Not provided'}\n"
            f"CONTACT EMAIL: {user.email}\n"
            f"ACCEPTED UPI VPA: {merchant.upi_vpa or 'Not configured'}"
        )
    except Exception as e:
        logger.error(f"Error in get_store_info: {e}", exc_info=True)
        return f"Error retrieving store info: {str(e)}"

@merchant_agent.tool
async def record_expense(
    ctx: RunContext[MerchantAgentDeps],
    amount: float,
    category: str,
    description: str,
) -> str:
    """Log a business expense into the merchant's financial ledger."""
    try:
        expense = Expense(
            merchant_id=ctx.deps.merchant.id,
            amount=Decimal(str(amount)),
            category=category,
            description=description,
        )
        ctx.deps.db.add(expense)
        await ctx.deps.db.flush()
        return f"Logged business expense of ₹{amount:.2f} under '{category}': {description}"
    except Exception as e:
        logger.error(f"Error in record_expense: {e}", exc_info=True)
        return f"Failed to record expense: {str(e)}"