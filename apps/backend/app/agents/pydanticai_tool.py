from sqlalchemy import select
from pydantic_ai import RunContext
from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.services.knowledge_service import search_catalog_chunks
from app.models.address import Address
from app.models.product import Product

@merchant_agent.tool
async def search_catalog(ctx: RunContext[MerchantAgentDeps], query: str = "all products") -> str:
    """Search the store product catalog for items, prices, stock levels, or full inventory checks."""
    results = await search_catalog_chunks(
        db=ctx.deps.db,
        merchant_id=ctx.deps.merchant.id,
        query=query,
        limit=20,
    )
    if results:
        return "\n".join(results)

    # Fallback to direct SQL query to ensure catalog items are always found
    stmt = select(Product).where(Product.merchant_id == ctx.deps.merchant.id).limit(20)
    products = (await ctx.deps.db.execute(stmt)).scalars().all()
    if products:
        lines = []
        for p in products:
            lines.append(
                f"Product: {p.name} | Selling Price: ₹{p.selling_price:.2f} | Cost Price: ₹{p.cost_price:.2f} | Current Stock: {p.current_stock} | Low Stock Alert: {p.low_stock_threshold or 5}"
            )
        return "\n".join(lines)

    return "No matching products found in the catalog."

@merchant_agent.tool
async def get_store_info(ctx: RunContext[MerchantAgentDeps], query: str = "store address and profile") -> str:
    """Look up verified merchant store details: physical store address, owner name, business phone, UPI ID, business type, and store policies."""
    merchant = ctx.deps.merchant
    user = ctx.deps.user

    addr_stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
    addr = (await ctx.deps.db.execute(addr_stmt)).scalars().first()

    address_str = "Not configured in settings"
    if addr:
        parts = [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode]
        valid_parts = [p for p in parts if p and p.strip()]
        if valid_parts:
            address_str = ", ".join(valid_parts)

    knowledge_parts = []
    if query:
        kb_results = await search_catalog_chunks(
            db=ctx.deps.db,
            merchant_id=merchant.id,
            query=query,
            limit=5,
        )
        if kb_results:
            knowledge_parts = kb_results

    details = [
        f"STORE NAME: {merchant.business_name}",
        f"BUSINESS TYPE / CATEGORY: {merchant.business_type}",
        f"STORE OWNER: {user.full_name or 'Store Owner'}",
        f"VERIFIED PHYSICAL STORE / DELIVERY ADDRESS: {address_str}",
        f"CONTACT PHONE: {user.phone_number or 'Not provided'}",
        f"CONTACT EMAIL: {user.email}",
        f"ACCEPTED UPI VPA: {merchant.upi_vpa or 'Not configured'}",
    ]
    if knowledge_parts:
        details.append("\nADDITIONAL STORE POLICIES & GUIDELINES:")
        details.extend(knowledge_parts)

    return "\n".join(details)