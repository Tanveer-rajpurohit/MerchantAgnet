import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.agent import AgentChatRequest
from app.services.agent_service import stream_merchant_chat

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