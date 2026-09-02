from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.audit_log import PaginatedAuditLogResponse
from app.repositories import audit_log_repository

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=PaginatedAuditLogResponse)
async def get_audit_logs(
    cursor: datetime | None = Query(None),
    limit: int = Query(15, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.merchant_profile
    if not profile:
        raise HTTPException(status_code=404, detail="Merchant profile not found")

    items, next_cursor, has_more = await audit_log_repository.list_by_merchant_cursor(
        db=db,
        merchant_id=profile.id,
        cursor=cursor,
        limit=limit,
    )

    return PaginatedAuditLogResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=has_more,
    )