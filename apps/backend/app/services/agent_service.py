import asyncio
import logging
import time
import uuid
from datetime import datetime
from typing import AsyncGenerator

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.merchant_profile import MerchantProfile
from app.models.customer_connection import CustomerConnection
from app.models.agent_run import AgentRun, AgentPersona, AgentRunStatus
from app.models.address import Address
from app.schemas.agent import (
    AgentChatRequest,
    AgentRunDTO,
    ChatSessionSummaryDTO,
    ChatSessionListResponse,
    ChatSessionHistoryResponse,
)
from app.agents.deps import MerchantAgentDeps, StoreProfileContext
from app.agents.pydanticai_tool import merchant_agent
from app.agents.customer_agent import customer_agent
from app.agents.customer_deps import CustomerAgentDeps
from app.models.conversation import SenderType
from app.repositories import agent_repository, message_repository
from pydantic_ai.messages import ModelRequest, ModelResponse, UserPromptPart, TextPart

logger = logging.getLogger(__name__)


def _build_store_profile(profile: MerchantProfile, user: User, addr: Address | None) -> StoreProfileContext:
    return StoreProfileContext(
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


async def _load_merchant_context(db: AsyncSession, user: User) -> tuple[MerchantProfile, StoreProfileContext]:
    """Resolve the merchant profile + assembled store profile for a user."""
    res = await db.execute(select(MerchantProfile).where(MerchantProfile.user_id == user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant profile not found for this user.",
        )
    addr_stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
    addr = (await db.execute(addr_stmt)).scalars().first()
    return profile, _build_store_profile(profile, user, addr)



async def stream_merchant_chat(
    db: AsyncSession,
    user: User,
    payload: AgentChatRequest,
) -> AsyncGenerator[dict, None]:
    """Stream one merchant_admin chat turn over SSE."""
    start_time = time.time()
    session_id = payload.session_id or uuid.uuid4()

    try:
        profile, store_profile = await _load_merchant_context(db, user)
    except HTTPException as he:
        yield {"type": "error", "content": he.detail}
        return

    target_cust_list = [
        {
            "customer_id": str(tc.customer_id) if tc.customer_id else None,
            "customer_connection_id": str(tc.customer_connection_id) if tc.customer_connection_id else None,
            "customer_name": tc.customer_name or "Customer",
            "customer_phone": tc.customer_phone,
        }
        for tc in (payload.target_customers or [])
    ]
    if not target_cust_list and payload.target_customer_name:
        target_cust_list.append({
            "customer_id": str(payload.target_customer_id) if payload.target_customer_id else None,
            "customer_connection_id": str(payload.target_customer_connection_id) if payload.target_customer_connection_id else None,
            "customer_name": payload.target_customer_name,
            "customer_phone": payload.target_customer_phone,
        })

    t_name = payload.target_customer_name or (target_cust_list[0]["customer_name"] if target_cust_list else None)
    t_phone = payload.target_customer_phone or (target_cust_list[0]["customer_phone"] if target_cust_list else None)
    t_conn_id = payload.target_customer_connection_id
    if not t_conn_id and target_cust_list and target_cust_list[0].get("customer_connection_id"):
        try:
            t_conn_id = uuid.UUID(target_cust_list[0]["customer_connection_id"])
        except (ValueError, TypeError):
            pass

    t_cust_id = payload.target_customer_id
    if not t_cust_id and target_cust_list and target_cust_list[0].get("customer_id"):
        try:
            t_cust_id = uuid.UUID(target_cust_list[0]["customer_id"])
        except (ValueError, TypeError):
            pass

    if not t_cust_id and t_conn_id:
        conn_res = await db.execute(select(CustomerConnection.customer_id).where(CustomerConnection.id == t_conn_id))
        t_cust_id = conn_res.scalar_one_or_none()

    if not t_cust_id and t_phone:
        clean_p = "".join(filter(str.isdigit, t_phone))[-10:]
        if len(clean_p) >= 10:
            u_res = await db.execute(select(User.id).where(User.phone_number.contains(clean_p)))
            t_cust_id = u_res.scalars().first()

    for tc in target_cust_list:
        if not tc.get("customer_id") and tc.get("customer_connection_id"):
            try:
                c_uuid = uuid.UUID(tc["customer_connection_id"])
                c_row = (await db.execute(select(CustomerConnection.customer_id).where(CustomerConnection.id == c_uuid))).scalar_one_or_none()
                if c_row:
                    tc["customer_id"] = str(c_row)
            except (ValueError, TypeError):
                pass
        if not tc.get("customer_id") and t_cust_id and len(target_cust_list) == 1:
            tc["customer_id"] = str(t_cust_id)

    deps = MerchantAgentDeps(
        db=db,
        merchant=profile,
        user=user,
        user_id=user.id,
        session_id=session_id,
        persona=payload.persona,
        store_profile=store_profile,
        current_date=datetime.now().strftime("%B %d, %Y"),
        target_customer_id=t_cust_id,
        target_customer_connection_id=t_conn_id,
        target_customer_name=t_name,
        target_customer_phone=t_phone,
        target_customers=target_cust_list,
    )

    # 1. Multi-turn memory: last 2 turns of this session (budget capped to prevent token bloat)
    previous_runs = await agent_repository.get_session_runs(
        db=db, merchant_id=profile.id, session_id=session_id,
    )
    message_history: list[ModelRequest | ModelResponse] = []
    for run in previous_runs[-2:]:
        resp_text = run.agent_response or ""
        if len(resp_text) > 500:
            resp_text = resp_text[:500] + "..."
        message_history.append(ModelRequest(parts=[UserPromptPart(content=run.user_message)]))
        message_history.append(ModelResponse(parts=[TextPart(content=resp_text)]))

    full_response = ""
    tools_invoked: list[dict] = []
    run_status = AgentRunStatus.success
    error_detail: str | None = None

    # 2. Stream the agent
    try:
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

        # Check if tools were executed and whether the stream yielded a post-tool text completion
        has_post_tool_text = False
        all_msgs = stream.all_messages()
        if tools_invoked and all_msgs:
            last_msg = all_msgs[-1]
            if isinstance(last_msg, ModelResponse):
                for part in getattr(last_msg, "parts", []):
                    if hasattr(part, "content") and part.content and part.content.strip():
                        has_post_tool_text = True
                        break

        # Fallback if streaming endpoint closed before post-tool completion (e.g. Sarvam / certain OpenAI-compatible endpoints)
        needs_fallback = (not full_response.strip()) or (bool(tools_invoked) and not has_post_tool_text)

        if needs_fallback:
            fallback_text = ""
            summary_lines = []
            if deps.created_payment_links:
                for pl in deps.created_payment_links:
                    cname = pl.get("customer_name") or deps.target_customer_name or "the customer"
                    summary_lines.append(f"Payment link for \u20b9{pl['amount']:.2f} created for {cname}: {pl['url']}")
            if deps.created_orders:
                for ord_info in deps.created_orders:
                    cname = ord_info.get("customer_name") or "Customer"
                    summary_lines.append(f"Order created for {cname} (Total: \u20b9{ord_info.get('total', 0):.2f}).")
            if deps.sent_messages:
                for sm in deps.sent_messages:
                    recs = sm.get("recipients", [])
                    rec_str = f" to {', '.join(recs)}" if recs else ""
                    summary_lines.append(f"Message successfully delivered{rec_str}.")

            if summary_lines:
                fallback_text = "\n".join(summary_lines)
            else:
                logger.info("Executing non-streaming synthesis fallback after stream closed...")
                run_res = await merchant_agent.run(
                    payload.message,
                    deps=deps,
                    message_history=message_history if message_history else None,
                )
                fallback_text = getattr(run_res, "output", getattr(run_res, "data", "")) or ""
                if not tools_invoked:
                    for msg in run_res.all_messages():
                        if hasattr(msg, "parts"):
                            for part in msg.parts:
                                if hasattr(part, "tool_name"):
                                    tools_invoked.append({
                                        "tool": getattr(part, "tool_name", ""),
                                        "args": getattr(part, "args", {}),
                                        "content": getattr(part, "content", ""),
                                    })

            if fallback_text:
                if full_response.strip():
                    full_response = f"{full_response}\n\n{fallback_text}"
                    yield {"type": "token", "content": "\n\n", "session_id": str(session_id)}
                else:
                    full_response = fallback_text

                words = fallback_text.split(" ")
                for i, w in enumerate(words):
                    token = w if i == len(words) - 1 else w + " "
                    yield {"type": "token", "content": token, "session_id": str(session_id)}
                    await asyncio.sleep(0.01)
    except Exception as agent_err:
        logger.exception("Agent run failed: %s", agent_err)
        run_status = AgentRunStatus.failed
        error_detail = str(agent_err)
        err_str = str(agent_err).lower()

        is_rate_limit = (
            "429" in err_str
            or "rate_limit" in err_str
            or "rate limit" in err_str
            or "quota" in err_str
            or "resource_exhausted" in err_str
            or "too many requests" in err_str
        )

        if is_rate_limit:
            friendly_text = (
                "Current load is too high. Please wait a few seconds, or upgrade to Premium for dedicated AI capacity."
            )
        else:
            friendly_text = (
                "The agent encountered a temporary issue while processing your request. Please try again or rephrase."
            )

        # Emit the token so the live chat displays the friendly notice and mounts the upgrade card
        yield {"type": "token", "content": friendly_text, "session_id": str(session_id)}
        full_response = friendly_text

    latency_ms = int((time.time() - start_time) * 1000)

    # 3. Persist the run (success OR failure) for the audit trail
    agent_run = AgentRun(
        session_id=session_id,
        merchant_id=profile.id,
        persona=payload.persona,
        user_message=payload.message,
        agent_response=full_response or "(no response)",
        tools_invoked=tools_invoked,
        status=run_status,
        latency_ms=latency_ms,
        error_detail=error_detail,
    )
    db.add(agent_run)
    await db.commit()

    # Include tools_invoked so the frontend cardParser can detect payment links
    yield {
        "type": "done",
        "session_id": str(session_id),
        "run_id": str(agent_run.id),
        "tools_invoked": tools_invoked,
    }



async def run_customer_chat(
    db: AsyncSession,
    merchant_profile: MerchantProfile,
    store_profile: StoreProfileContext,
    customer: User | None,
    message: str,
    connection_id: uuid.UUID | None = None,
) -> tuple[str, list[dict]]:

    start_time = time.time()

    deps = CustomerAgentDeps(
        db=db,
        merchant=merchant_profile,
        merchant_id=merchant_profile.id,
        customer_id=customer.id if customer else None,
        customer_name=customer.full_name if customer else "",
        customer_phone=customer.phone_number if customer else "",
        connection_id=connection_id,
        store_name=store_profile.store_name,
        store_category=store_profile.category,
        store_address=store_profile.full_address,
        store_upi_vpa=store_profile.upi_vpa,
    )

    message_history: list[ModelRequest | ModelResponse] = []
    if connection_id:
        try:
            past_msgs = await message_repository.list_messages_by_connection(
                db=db,
                customer_connection_id=connection_id,
                limit=6,
            )
            if past_msgs and past_msgs[0].content.strip() == message.strip() and past_msgs[0].sender_type == SenderType.customer:
                past_msgs = past_msgs[1:]
            past_msgs = list(reversed(past_msgs))
            for pm in past_msgs:
                c_text = pm.content or ""
                if len(c_text) > 600:
                    c_text = c_text[:600] + "..."
                if pm.sender_type == SenderType.customer:
                    message_history.append(ModelRequest(parts=[UserPromptPart(content=c_text)]))
                else:
                    message_history.append(ModelResponse(parts=[TextPart(content=c_text)]))
        except Exception as hist_err:
            logger.warning("Failed to load customer chat history: %s", hist_err)

    full_response = ""
    tools_invoked: list[dict] = []

    try:
        run_res = await customer_agent.run(
            message,
            deps=deps,
            message_history=message_history if message_history else None,
        )
        full_response = getattr(run_res, "output", getattr(run_res, "data", "")) or ""
        if hasattr(run_res, "all_messages"):
            for msg in run_res.all_messages():
                if hasattr(msg, "parts"):
                    for part in msg.parts:
                        if hasattr(part, "tool_name"):
                            tools_invoked.append({
                                "tool": getattr(part, "tool_name", ""),
                                "args": getattr(part, "args", {}),
                            })
        run_status = AgentRunStatus.success
        error_detail = None
    except Exception as agent_err:
        logger.exception("Customer agent run failed: %s", agent_err)
        err_str = str(agent_err).lower()
        if (
            "429" in err_str
            or "rate_limit" in err_str
            or "rate limit" in err_str
            or "quota" in err_str
            or "too many requests" in err_str
        ):
            full_response = (
                "The store assistant is currently experiencing high demand. Please try again in a few moments."
            )
        else:
            full_response = (
                "I'm sorry, I couldn't process that just now. Please message the store "
                "directly and the owner will get back to you."
            )
        run_status = AgentRunStatus.failed
        error_detail = str(agent_err)

    latency_ms = int((time.time() - start_time) * 1000)

    agent_run = AgentRun(
        merchant_id=merchant_profile.id,
        persona=AgentPersona.customer_shopfront,
        user_message=message,
        agent_response=full_response,
        tools_invoked=tools_invoked,
        status=run_status,
        latency_ms=latency_ms,
        error_detail=error_detail,
    )
    db.add(agent_run)
    await db.commit()

    return full_response, tools_invoked



async def list_merchant_sessions(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    cursor: datetime | None = None,
    limit: int = 20,
) -> ChatSessionListResponse:
    sessions, next_cursor, has_more = await agent_repository.list_merchant_sessions(
        db=db, merchant_id=merchant_id, cursor=cursor, limit=limit,
    )
    return ChatSessionListResponse(
        sessions=sessions, next_cursor=next_cursor, has_more=has_more,
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
        db=db, merchant_id=merchant_id, session_id=session_id, new_title=new_title.strip(),
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
        db=db, merchant_id=merchant_id, session_id=session_id,
    )
    if not runs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or has no message history",
        )
    run_dtos = [AgentRunDTO.model_validate(r) for r in runs]
    return ChatSessionHistoryResponse(
        session_id=session_id, runs=run_dtos, total_turns=len(run_dtos),
    )


async def delete_session(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
) -> dict[str, str]:
    deleted_count = await agent_repository.delete_session_runs(
        db=db, merchant_id=merchant_id, session_id=session_id,
    )
    if deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    await db.commit()
    return {"message": f"Successfully deleted session and {deleted_count} turns"}
