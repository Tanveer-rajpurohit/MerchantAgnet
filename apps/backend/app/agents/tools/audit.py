import logging
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.repositories import audit_log_repository
from app.agents.tools.common import _merchant_id, _guard_merchant

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def get_audit_log(
    ctx: RunContext[MerchantAgentDeps],
    limit: int = 10,
) -> str:
    """Return the merchant's most recent audit-log entries (default 10).

    Every agent + user action is logged here — payment links, orders, expenses,
    products, campaigns. Use this to review what has happened, troubleshoot, or
    answer "what did the agent do?" / "what did I do recently?".
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        cap = max(1, min(int(limit), 50))
        rows, next_cursor, has_more = await audit_log_repository.list_by_merchant_cursor(
            db=ctx.deps.db,
            merchant_id=_merchant_id(ctx),
            cursor=None,
            limit=cap,
        )
        if not rows:
            return "No audit log entries yet."

        lines = ["TIMESTAMP | ACTION | ENTITY_TYPE | ENTITY_ID | DETAILS"]
        for row in rows:
            details_str = str(row.details or {})
            if len(details_str) > 120:
                details_str = details_str[:117] + "..."
            lines.append(
                f"{row.created_at.isoformat()} | {row.action} | {row.entity_type} | "
                f"{row.entity_id} | {details_str}"
            )
        if has_more:
            lines.append(f"\n(More entries available — call get_audit_log with a higher limit.)")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_audit_log: %s", e, exc_info=True)
        return f"Error retrieving audit log: {str(e)}"
