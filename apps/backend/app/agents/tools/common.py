import uuid
from pydantic_ai import RunContext
from app.agents.deps import MerchantAgentDeps
from app.models.agent_run import AgentPersona


def _is_merchant(ctx: RunContext[MerchantAgentDeps]) -> bool:
    return ctx.deps.persona == AgentPersona.merchant_admin


def _merchant_id(ctx: RunContext[MerchantAgentDeps]) -> uuid.UUID:
    return ctx.deps.merchant.id


def _actor_user_id(ctx: RunContext[MerchantAgentDeps]) -> uuid.UUID | None:
    return ctx.deps.user_id or (ctx.deps.user.id if ctx.deps.user else None)


def _guard_merchant(ctx: RunContext[MerchantAgentDeps]) -> str | None:
    if not _is_merchant(ctx):
        return "This action is only available to the merchant. Customers cannot perform it."
    return None


from contextlib import asynccontextmanager

@asynccontextmanager
async def lock_db(ctx: RunContext):
    lock = getattr(ctx.deps, "db_lock", None)
    if lock:
        async with lock:
            yield
    else:
        yield

