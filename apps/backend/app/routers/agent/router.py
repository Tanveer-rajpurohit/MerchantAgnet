import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.agent import (
    AgentChatRequest,
    RenameSessionRequest,
    ChatSessionSummaryDTO,
    ChatSessionListResponse,
    ChatSessionHistoryResponse,
)
from app.services.agent_service import (
    stream_merchant_chat,
    list_merchant_sessions,
    rename_session,
    get_session_history,
    delete_session,
)

router = APIRouter(prefix="/agent", tags=["AI Agent"])

@router.post("/chat/stream")
async def chat_stream_endpoint(
    payload: AgentChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user",
        )

    async def event_generator():
        async for event in stream_merchant_chat(db=db, user=current_user, payload=payload):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@router.get("/sessions", response_model=ChatSessionListResponse)
async def list_sessions_endpoint(
    cursor: datetime | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user",
        )
    return await list_merchant_sessions(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        cursor=cursor,
        limit=limit,
    )

@router.patch("/sessions/{session_id}", response_model=ChatSessionSummaryDTO)
async def rename_session_endpoint(
    session_id: uuid.UUID,
    payload: RenameSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user",
        )
    return await rename_session(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        session_id=session_id,
        new_title=payload.title,
    )

@router.get("/sessions/{session_id}", response_model=ChatSessionHistoryResponse)
async def get_session_history_endpoint(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user",
        )
    return await get_session_history(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        session_id=session_id,
    )

@router.delete("/sessions/{session_id}")
async def delete_session_endpoint(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user",
        )
    return await delete_session(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        session_id=session_id,
    )