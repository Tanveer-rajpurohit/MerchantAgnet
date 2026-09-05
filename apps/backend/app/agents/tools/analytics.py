import logging

from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.agents.tools.common import _guard_merchant, lock_db
from app.services import analytics_service

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def get_daily_collection(
    ctx: RunContext[MerchantAgentDeps],
    day: str = "today",
    **kwargs,
) -> str:
    """Fetch pure cash & UPI collections and store profit for a single day (today OR yesterday).

    MANDATORY TOOL: Call this tool when the merchant asks about a single day's collection, earnings, or profit:
    - "How much did I earn today?", "Aaj kitna collection hua?", "Aaj ki kamai", "Today profit", "Give me today profit"
    - "How much did I earn yesterday?", "Kal kitna aaya?", "Yesterday profit", "Give me yesterday profit"
    - "Who paid me today?", "Aaj kin customers ne payment kiya?"

    STRICT: This tool represents the full day's earnings and profit (sales revenue). DO NOT call `get_current_expenses` when answering this.
    DO NOT call this tool if the user asks for multiple periods at once (e.g. today AND yesterday, or today AND this month, or earnings AND udhaar). For multi-period or combined queries, call `get_store_earnings_analytics(timeframe="summary")` instead.

    Args:
        day: 'today' or 'yesterday'. Default is 'today'.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            return await analytics_service.get_daily_collection_service(
                db=ctx.deps.db,
                merchant=ctx.deps.merchant,
                day=day,
            )
    except Exception as e:
        logger.error("Error in get_daily_collection: %s", e, exc_info=True)
        return f"Failed to compute daily collection: {str(e)}"


@merchant_agent.tool
async def get_customer_udhaar_ledger(
    ctx: RunContext[MerchantAgentDeps],
    customer_name: str | None = None,
    **kwargs,
) -> str:
    """Fetch outstanding customer debts (udhaar), credit balances, and customer phone numbers.

    MANDATORY TOOL: Call this tool ONLY when the merchant asks EXCLUSIVELY about customer dues or udhaar alone:
    - "Who owes me money?", "Total udhaar kitna hai?", "Pending payments list"
    - "Does Rajesh owe any money?", "Check dues for Tanveer"

    DO NOT call this tool if the user also asks about today's earnings or monthly collections in the same query. For combined queries, call `get_store_earnings_analytics(timeframe="summary")` instead.

    Args:
        customer_name: Optional customer name (e.g. 'Rajesh' or 'Tanveer Singh') to check that specific customer's balance.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            return await analytics_service.get_customer_udhaar_ledger_service(
                db=ctx.deps.db,
                merchant=ctx.deps.merchant,
                customer_name=customer_name,
            )
    except Exception as e:
        logger.error("Error in get_customer_udhaar_ledger: %s", e, exc_info=True)
        return f"Failed to compute customer udhaar ledger: {str(e)}"


@merchant_agent.tool
async def get_store_revenue_report(
    ctx: RunContext[MerchantAgentDeps],
    timeframe: str = "this_month",
    include_expenses: bool = False,
    **kwargs,
) -> str:
    """Generate a periodic store revenue, profit, and sales collections report with explicit date ranges.

    MANDATORY TOOL: Call this tool whenever the merchant asks about revenue, profit, collections, sales, or earnings for a period:
    - "What is my revenue this week?", "Show this month's earnings", "Annual collections"
    - "Give me this month profit", "This week profit", "What is my profit this week?"

    Returns:
        Gross Collections, paid payment links total, paid store orders total, and date range.
        This tool strictly reflects revenue, sales, and retail profit. It does NOT deduct store expenses or show negative losses.
        (Operating expenses are managed separately via `get_current_expenses`).

    Args:
        timeframe: One of 'this_week', 'this_month', 'this_year', or 'all_time'. Default is 'this_month'.
        include_expenses: Ignored. Operating expenses are managed exclusively via `get_current_expenses`.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            return await analytics_service.get_store_revenue_report_service(
                db=ctx.deps.db,
                merchant=ctx.deps.merchant,
                timeframe=timeframe,
            )
    except Exception as e:
        logger.error("Error in get_store_revenue_report: %s", e, exc_info=True)
        return f"Failed to compute store revenue report: {str(e)}"


@merchant_agent.tool
async def get_store_financial_report(
    ctx: RunContext[MerchantAgentDeps],
    timeframe: str = "this_month",
    include_expenses: bool = False,
    **kwargs,
) -> str:
    """Periodic store revenue, profit, and sales collections report (alias for get_store_revenue_report)."""
    return await get_store_revenue_report(ctx, timeframe=timeframe, include_expenses=include_expenses, **kwargs)


@merchant_agent.tool
async def get_store_earnings_analytics(
    ctx: RunContext[MerchantAgentDeps],
    timeframe: str = "summary",
    customer_name: str | None = None,
    **kwargs,
) -> str:
    """Master multi-period financial & collections summary.

    MANDATORY TOOL: Call this tool whenever the merchant asks for:
    - Multiple timeframes at once: e.g. "How much did I earn today, yesterday, and this month?"
    - Combined earnings AND udhaar: e.g. "Give me today's earnings and who owes me money"
    - Comprehensive store overview / dashboard

    Calling this SINGLE tool answers today + yesterday + month collections + udhaar with customer phone numbers in ONE shot without needing multiple tool calls!
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            return await analytics_service.calculate_store_earnings_analytics(
                db=ctx.deps.db,
                merchant=ctx.deps.merchant,
                timeframe=timeframe,
                customer_name=customer_name,
            )
    except Exception as e:
        logger.error("Error in get_store_earnings_analytics: %s", e, exc_info=True)
        return f"Failed to compute store earnings analytics: {str(e)}"
