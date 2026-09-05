from pydantic_ai import Agent, RunContext
from pydantic_ai.settings import ModelSettings
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from app.core.config import settings
from app.agents.deps import MerchantAgentDeps
from app.agents.prompts import build_merchant_constitution

custom_provider = OpenAIProvider(
    base_url=settings.AGENT_BASE_URL,
    api_key=settings.AGENT_API_KEY,
)

groq_model = OpenAIChatModel(model_name=settings.AGENT_MODEL, provider=custom_provider)

merchant_agent = Agent(
    groq_model,
    deps_type=MerchantAgentDeps,
    model_settings=ModelSettings(max_tokens=8192),
)

from sqlalchemy import select
from app.models.address import Address

@merchant_agent.system_prompt
async def dynamic_system_prompt(ctx: RunContext[MerchantAgentDeps]) -> str:
    target_name = ctx.deps.target_customer_name or (ctx.deps.user.full_name if ctx.deps.user else "") or ""
    target_phone = ctx.deps.target_customer_phone or (ctx.deps.user.phone_number if ctx.deps.user else "") or ""
    target_conn_id = str(ctx.deps.target_customer_connection_id) if ctx.deps.target_customer_connection_id else ""
    target_cust_id = str(ctx.deps.target_customer_id) if ctx.deps.target_customer_id else (str(ctx.deps.user.id) if ctx.deps.user else "")

    sp = ctx.deps.store_profile
    if sp:
        return build_merchant_constitution(
            store_name=sp.store_name,
            category=sp.category,
            persona=ctx.deps.persona,
            owner_name=sp.owner_name,
            address=sp.full_address,
            phone=sp.phone,
            upi_vpa=sp.upi_vpa,
            target_customer_name=target_name,
            target_customer_phone=target_phone,
            target_customer_connection_id=target_conn_id,
            target_customer_id=target_cust_id,
            target_customers=ctx.deps.target_customers,
        )

    merchant = ctx.deps.merchant
    store_name = merchant.business_name if merchant else "Your Store"
    category = merchant.business_type if merchant else "Retail Commerce"
    upi_vpa = merchant.upi_vpa if merchant and merchant.upi_vpa else ""

    user = ctx.deps.user
    owner_name = user.full_name if user and user.full_name else ""
    phone = user.phone_number if user and user.phone_number else ""

    address_str = ""
    if user:
        addr_stmt = select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
        addr = (await ctx.deps.db.execute(addr_stmt)).scalars().first()
        if addr:
            parts = [addr.line1, addr.line2, addr.landmark, addr.city, addr.state, addr.pincode]
            address_str = ", ".join(p for p in parts if p)

    return build_merchant_constitution(
        store_name=store_name,
        category=category,
        persona=ctx.deps.persona,
        owner_name=owner_name,
        address=address_str,
        phone=phone,
        upi_vpa=upi_vpa,
        target_customer_name=target_name,
        target_customer_phone=target_phone,
        target_customer_connection_id=target_conn_id,
        target_customer_id=target_cust_id,
        target_customers=ctx.deps.target_customers,
    )