import time
import uuid
from datetime import datetime
from typing import AsyncGenerator
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.agent_run import AgentRun, AgentPersona, AgentRunStatus
from app.models.merchant_profile import MerchantProfile
from app.schemas.agent import (
    AgentChatRequest,
    AgentRunDTO,
    ChatSessionSummaryDTO,
    ChatSessionListResponse,
    ChatSessionHistoryResponse,
)
from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.repositories import agent_repository
from sqlalchemy import select
from pydantic_ai.messages import ModelRequest, ModelResponse, UserPromptPart, TextPart

async def stream_merchant_chat(
    db: AsyncSession,
    user: User,
    payload: AgentChatRequest,
) -> AsyncGenerator[dict, None]:
    start_time = time.time()
    session_id = payload.session_id or uuid.uuid4()

    res = await db.execute(select(MerchantProfile).where(MerchantProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        yield {"type": "error", "content": "Merchant profile not found for this user."}
        return

    from app.models.address import Address
    from app.agents.deps import StoreProfileContext

    addr_stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
    addr = (await db.execute(addr_stmt)).scalars().first()

    store_profile = StoreProfileContext(
        store_name=profile.business_name if profile else "Your Store",
        category=profile.business_type if profile else "Retail Store",
        owner_name=user.full_name or "Store Owner",
        phone=user.phone_number or "",
        email=user.email or "",
        address_line1=addr.line1 if addr else "",
        address_line2=addr.line2 if addr else "",
        city=addr.city if addr else "",
        state=addr.state if addr else "",
        pincode=addr.pincode if addr else "",
        upi_vpa=profile.upi_vpa if profile and profile.upi_vpa else "",
    )

    deps = MerchantAgentDeps(
        db=db,
        merchant=profile,
        user=user,
        session_id=session_id,
        persona=payload.persona,
        store_profile=store_profile,
        current_date=datetime.now().strftime("%B %d, %Y"),
    )

    # 1. Multi-turn memory: load previous turns for this session
    previous_runs = await agent_repository.get_session_runs(
        db=db,
        merchant_id=profile.id,
        session_id=session_id,
    )
    
    message_history: list[ModelRequest | ModelResponse] = []
    # Take last 6 turns for optimal token budget and to avoid TPM rate limits
    for run in previous_runs[-6:]:
        message_history.append(
            ModelRequest(parts=[UserPromptPart(content=run.user_message)])
        )
        message_history.append(
            ModelResponse(parts=[TextPart(content=run.agent_response)])
        )

    full_response = ""
    tools_invoked: list[dict] = []

    # 2. Execute streaming with conversation memory
    async with merchant_agent.run_stream(
        payload.message,
        deps=deps,
        message_history=message_history if message_history else None,
    ) as stream:
        async for chunk in stream.stream_text(delta=True):
            full_response += chunk
            yield {"type": "token", "content": chunk, "session_id": str(session_id)}

        for msg in stream.all_messages():
            if hasattr(msg, "parts"):
                for part in msg.parts:
                    if hasattr(part, "tool_name"):
                        tools_invoked.append({
                            "tool": getattr(part, "tool_name", ""),
                            "args": getattr(part, "args", {}),
                            "content": getattr(part, "content", ""),
                        })

    latency_ms = int((time.time() - start_time) * 1000)

    # 3. Persist this turn to agent_runs
    agent_run = AgentRun(
        session_id=session_id,
        merchant_id=profile.id,
        persona=payload.persona,
        user_message=payload.message,
        agent_response=full_response,
        tools_invoked=tools_invoked,
        status=AgentRunStatus.success,
        latency_ms=latency_ms,
    )
    db.add(agent_run)
    await db.commit()

    yield {"type": "done", "session_id": str(session_id), "run_id": str(agent_run.id)}

async def list_merchant_sessions(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    cursor: datetime | None = None,
    limit: int = 20,
) -> ChatSessionListResponse:
    sessions, next_cursor, has_more = await agent_repository.list_merchant_sessions(
        db=db,
        merchant_id=merchant_id,
        cursor=cursor,
        limit=limit,
    )
    return ChatSessionListResponse(
        sessions=sessions,
        next_cursor=next_cursor,
        has_more=has_more,
    )

async def rename_session(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
    new_title: str,
) -> ChatSessionSummaryDTO:
    if not new_title or not new_title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session title cannot be empty",
        )
    summary = await agent_repository.rename_session(
        db=db,
        merchant_id=merchant_id,
        session_id=session_id,
        new_title=new_title.strip(),
    )
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    await db.commit()
    return summary

async def get_session_history(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
) -> ChatSessionHistoryResponse:
    runs = await agent_repository.get_session_runs(
        db=db,
        merchant_id=merchant_id,
        session_id=session_id,
    )
    if not runs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or has no message history",
        )
    run_dtos = [AgentRunDTO.model_validate(r) for r in runs]
    return ChatSessionHistoryResponse(
        session_id=session_id,
        runs=run_dtos,
        total_turns=len(run_dtos),
    )

async def delete_session(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
) -> dict[str, str]:
    deleted_count = await agent_repository.delete_session_runs(
        db=db,
        merchant_id=merchant_id,
        session_id=session_id,
    )
    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    await db.commit()
    return {"message": f"Successfully deleted session and {deleted_count} turns"}