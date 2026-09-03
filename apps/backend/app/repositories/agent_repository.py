import uuid
from datetime import datetime
from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent_run import AgentRun
from app.schemas.agent import ChatSessionSummaryDTO

async def list_merchant_sessions(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    cursor: datetime | None = None,
    limit: int = 20,
) -> tuple[list[ChatSessionSummaryDTO], datetime | None, bool]:
    # 1. Base grouping query
    stats_query = (
        select(
            AgentRun.session_id,
            func.max(AgentRun.created_at).label("last_active_at"),
            func.count(AgentRun.id).label("total_turns"),
        )
        .where(
            and_(
                AgentRun.merchant_id == merchant_id,
                AgentRun.session_id.is_not(None),
            )
        )
        .group_by(AgentRun.session_id)
    )

    # 2. Cursor filtering on grouped max(created_at)
    if cursor is not None:
        stats_query = stats_query.having(func.max(AgentRun.created_at) < cursor)

    stats_query = stats_query.order_by(desc(func.max(AgentRun.created_at))).limit(limit + 1)
    
    stats_res = await db.execute(stats_query)
    rows = stats_res.all()
    if not rows:
        return [], None, False

    has_more = len(rows) > limit
    active_rows = rows[:limit]

    summaries: list[ChatSessionSummaryDTO] = []
    
    for session_id, last_active_at, total_turns in active_rows:
        # Get first run for title and metadata
        first_run_stmt = (
            select(AgentRun)
            .where(
                and_(
                    AgentRun.merchant_id == merchant_id,
                    AgentRun.session_id == session_id,
                )
            )
            .order_by(AgentRun.created_at.asc())
            .limit(1)
        )
        first_run = (await db.execute(first_run_stmt)).scalar_one_or_none()
        
        # Check custom title from session metadata
        custom_title = None
        if first_run and first_run.tools_invoked:
            for tool in first_run.tools_invoked:
                if isinstance(tool, dict) and tool.get("type") == "session_meta":
                    custom_title = tool.get("custom_title")
                    break

        if custom_title:
            title = custom_title
        elif first_run and first_run.user_message:
            msg = first_run.user_message.strip()
            title = msg[:45] + "..." if len(msg) > 45 else msg
        else:
            title = "New Conversation"
        
        # Get latest run for preview
        last_run_stmt = (
            select(AgentRun.agent_response)
            .where(
                and_(
                    AgentRun.merchant_id == merchant_id,
                    AgentRun.session_id == session_id,
                )
            )
            .order_by(AgentRun.created_at.desc())
            .limit(1)
        )
        last_resp = (await db.execute(last_run_stmt)).scalar_one_or_none() or ""
        last_preview = last_resp[:60] + "..." if len(last_resp) > 60 else last_resp

        summaries.append(
            ChatSessionSummaryDTO(
                session_id=session_id,
                title=title,
                last_message=last_preview,
                last_active_at=last_active_at,
                total_turns=total_turns,
            )
        )

    next_cursor = summaries[-1].last_active_at if has_more and summaries else None
    return summaries, next_cursor, has_more

async def rename_session(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
    new_title: str,
) -> ChatSessionSummaryDTO | None:
    first_run_stmt = (
        select(AgentRun)
        .where(
            and_(
                AgentRun.merchant_id == merchant_id,
                AgentRun.session_id == session_id,
            )
        )
        .order_by(AgentRun.created_at.asc())
        .limit(1)
    )
    first_run = (await db.execute(first_run_stmt)).scalar_one_or_none()
    if not first_run:
        return None

    # Update or insert session_meta in tools_invoked
    tools = list(first_run.tools_invoked) if first_run.tools_invoked else []
    updated = False
    for tool in tools:
        if isinstance(tool, dict) and tool.get("type") == "session_meta":
            tool["custom_title"] = new_title.strip()
            updated = True
            break
    if not updated:
        tools.append({"type": "session_meta", "custom_title": new_title.strip()})
    
    first_run.tools_invoked = tools
    await db.flush()

    # Get last active stats
    stats_query = (
        select(
            func.max(AgentRun.created_at).label("last_active_at"),
            func.count(AgentRun.id).label("total_turns"),
        )
        .where(
            and_(
                AgentRun.merchant_id == merchant_id,
                AgentRun.session_id == session_id,
            )
        )
    )
    res = (await db.execute(stats_query)).first()
    last_active_at = res.last_active_at if res else first_run.created_at
    total_turns = res.total_turns if res else 1

    return ChatSessionSummaryDTO(
        session_id=session_id,
        title=new_title.strip(),
        last_message=first_run.agent_response[:60],
        last_active_at=last_active_at,
        total_turns=total_turns,
    )

async def get_session_runs(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
) -> list[AgentRun]:
    stmt = (
        select(AgentRun)
        .where(
            and_(
                AgentRun.merchant_id == merchant_id,
                AgentRun.session_id == session_id,
            )
        )
        .order_by(AgentRun.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def delete_session_runs(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    session_id: uuid.UUID,
) -> int:
    from sqlalchemy import delete
    stmt = (
        delete(AgentRun)
        .where(
            and_(
                AgentRun.merchant_id == merchant_id,
                AgentRun.session_id == session_id,
            )
        )
    )
    result = await db.execute(stmt)
    await db.flush()
    return result.rowcount
