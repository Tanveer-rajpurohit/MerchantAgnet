import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import message_service
from app.schemas.message import PaginatedMessageResponse

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get(
    "/{customer_connection_id}",
    response_model=PaginatedMessageResponse,
)
async def list_messages(
    customer_connection_id: uuid.UUID,
    cursor: datetime | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await message_service.list_connection_messages(
        db=db,
        connection_id=customer_connection_id,
        current_user=current_user,
        cursor=cursor,
        limit=limit,
    )
