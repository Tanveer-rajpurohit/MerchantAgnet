import time
import uuid
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.agent_run import AgentRun, AgentPersona, AgentRunStatus
from app.schemas.agent import AgentChatRequest
from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.merchant_profile import MerchantProfile
from sqlalchemy import select

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

    deps = MerchantAgentDeps(db=db, merchant=profile, user=user, session_id=session_id)

    full_response = ""
    tools_invoked: list[dict] = []

    async with merchant_agent.run_stream(payload.message, deps=deps) as stream:
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