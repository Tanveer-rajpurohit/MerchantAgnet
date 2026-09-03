from pydantic_ai import RunContext
from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.services.knowledge_service import search_catalog_chunks

@merchant_agent.tool
async def search_catalog(ctx: RunContext[MerchantAgentDeps], query: str) -> str:
    """Search the store product catalog semantically for items, stock levels, and pricing."""
    results = await search_catalog_chunks(
        db=ctx.deps.db,
        merchant_id=ctx.deps.merchant.id,
        query=query,
        limit=3,
    )
    if not results:
        return "No matching products found in the catalog."
    return "\n".join(results)

@merchant_agent.tool
async def get_store_info(ctx: RunContext[MerchantAgentDeps], query: str) -> str:
    """Look up store profile details, accepted UPI payment address, store policies, customer rules, and home delivery information."""
    results = await search_catalog_chunks(
        db=ctx.deps.db,
        merchant_id=ctx.deps.merchant.id,
        query=query,
        limit=3,
    )
    if not results:
        return "No store details or policy rules found."
    return "\n".join(results)