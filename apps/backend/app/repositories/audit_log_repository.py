import uuid
from datetime import datetime
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog

async def log_action(
    db: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: str,
    merchant_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    details: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        merchant_id=merchant_id,
        user_id=user_id,
        details=details or {},
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(entry)
    await db.flush()
    return entry

async def list_by_merchant_cursor(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    cursor: datetime | None = None,
    limit: int = 15,
) -> tuple[list[AuditLog], datetime | None, bool]:
    query = select(AuditLog).where(AuditLog.merchant_id == merchant_id)

    if cursor is not None:
        query = query.where(AuditLog.created_at < cursor)

    query = query.order_by(AuditLog.created_at.desc()).limit(limit + 1)
    result = await db.execute(query)
    rows = list(result.scalars().all())

    has_more = len(rows) > limit
    items = rows[:limit]

    next_cursor = items[-1].created_at if has_more and items else None
    return items, next_cursor, has_more