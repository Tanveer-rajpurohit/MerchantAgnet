import uuid
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.repositories import customer_connection_repository, message_repository
from app.schemas.message import (
    MessageResponse,
    PaginatedMessageResponse,
)

async def list_connection_messages(
    db: AsyncSession,
    connection_id: uuid.UUID,
    current_user: User,
    cursor: datetime | None = None,
    limit: int = 30,
) -> PaginatedMessageResponse:
    merchant_id = current_user.merchant_profile.id if current_user.merchant_profile else None
    connection = await customer_connection_repository.get_by_id(
        db=db,
        connection_id=connection_id,
        merchant_id=merchant_id if current_user.role == UserRole.merchant else None,
    )
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer connection not found",
        )
    if current_user.role == UserRole.customer and connection.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    raw_messages = await message_repository.list_messages_by_connection(
        db=db,
        customer_connection_id=connection_id,
        cursor=cursor,
        limit=limit,
    )
    has_more = len(raw_messages) > limit
    batch = raw_messages[:limit]
    next_cursor = batch[-1].created_at if has_more and batch else None
    chronological = [MessageResponse.model_validate(m) for m in reversed(batch)]

    return PaginatedMessageResponse(
        items=chronological,
        next_cursor=next_cursor,
        has_more=has_more,
    )
