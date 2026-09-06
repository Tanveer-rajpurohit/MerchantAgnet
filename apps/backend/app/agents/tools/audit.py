import re
import logging
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.repositories import audit_log_repository
from app.agents.tools.common import _merchant_id, _guard_merchant

logger = logging.getLogger(__name__)

# Match a UUID v4 — used to redact IDs from audit details before showing to the agent.
_UUID_RE = re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.IGNORECASE)


def _humanize_action(action: str, details: dict) -> str:
    """Turn an audit row into a short, human-readable summary with NO UUIDs."""
    d = details or {}
    if action == "payment_link.created":
        return f"Created ₹{d.get('amount', '?')} payment link for {d.get('customer_name', 'customer')}"
    if action == "payment_link.paid":
        return f"Payment received — ₹{d.get('amount', '?')} from {d.get('customer_name', 'customer')}"
    if action == "payment_link.status_checked":
        return f"Checked link status — {d.get('status', '?')}"
    if action == "order.created":
        return f"Created order ₹{d.get('total_amount', '?')} for {d.get('customer_name', d.get('customer_id', 'customer'))} ({d.get('item_count', '?')} items)"
    if action == "order.status_updated":
        return f"Order marked {d.get('new_status', '?')}"
    if action == "expense.created":
        return f"Logged ₹{d.get('amount', '?')} expense under {d.get('category', '?')}"
    if action == "expense.updated":
        return f"Updated {d.get('category', d.get('before', {}).get('category', '?'))} expense"
    if action == "expense.deleted":
        return f"Deleted {d.get('category', '?')} expense"
    if action == "product.created":
        return f"Added product {d.get('name', '?')}"
    if action == "product.updated":
        return f"Updated product {d.get('name', '?')}"
    if action == "product.deleted":
        return f"Deleted product {d.get('name', '?')}"
    if action == "customer.message_sent":
        return f"Sent message to {d.get('customer_name', 'customer')}"
    if action == "campaign.drafted":
        return f"Drafted campaign {d.get('offer', '?')} for {d.get('target_count', '?')} customers"
    if action == "campaign.approved":
        return f"Approved campaign — {d.get('sent', 0)} sent, {d.get('failed', 0)} failed"
    if action == "campaign.declined":
        return "Declined campaign"
    # Fallback — action name with details, but UUIDs redacted
    raw = str(d)
    return f"{action} — {_UUID_RE.sub('[id]', raw)[:100]}"


@merchant_agent.tool
async def get_audit_log(
    ctx: RunContext[MerchantAgentDeps],
    limit: int = 10,
) -> str:
    """Return the merchant's most recent audit-log entries (default 10).

    Every agent + user action is logged here — payment links, orders, expenses,
    products, campaigns. Use this to review what has happened, troubleshoot, or
    answer "what did the agent do?" / "what did I do recently?".

    Present the results to the merchant as a clean Time | Action | Summary table.
    NEVER show ENTITY_ID, raw UUIDs, or the raw DETAILS JSON to the merchant.
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

        # Clean, merchant-facing table — NO UUIDs, NO raw JSON.
        lines = ["| Time | Action | Summary |", "| :--- | :--- | :--- |"]
        for row in rows:
            time_str = row.created_at.strftime("%b %d, %H:%M")
            summary = _humanize_action(row.action, row.details or {})
            lines.append(f"| {time_str} | {row.action} | {summary} |")
        if has_more:
            lines.append("\n(More entries available — call get_audit_log with a higher limit.)")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_audit_log: %s", e, exc_info=True)
        return f"Error retrieving audit log: {str(e)}"
