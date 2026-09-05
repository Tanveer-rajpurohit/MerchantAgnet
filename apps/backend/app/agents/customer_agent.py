from pydantic_ai import Agent, RunContext
from pydantic_ai.settings import ModelSettings
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from app.core.config import settings
from app.agents.customer_deps import CustomerAgentDeps
from app.agents.customer_prompt import build_customer_prompt

custom_provider = OpenAIProvider(
    base_url=settings.AGENT_BASE_URL,
    api_key=settings.AGENT_API_KEY or "mock-agent-key",
)

customer_model = OpenAIChatModel(
    model_name=settings.AGENT_MODEL,
    provider=custom_provider,
)

customer_agent = Agent(
    customer_model,
    deps_type=CustomerAgentDeps,
    model_settings=ModelSettings(max_tokens=4096),
)


@customer_agent.system_prompt
async def customer_system_prompt(ctx: RunContext[CustomerAgentDeps]) -> str:
    return build_customer_prompt(
        store_name=ctx.deps.store_name,
        store_category=ctx.deps.store_category,
        store_address=ctx.deps.store_address,
        store_upi_vpa=ctx.deps.store_upi_vpa,
        customer_name=ctx.deps.customer_name,
        customer_phone=ctx.deps.customer_phone,
    )


from app.agents.tools.customer_catalog import get_store_products as _get_store_products
from app.agents.tools.customer_orders import place_order as _place_order
from app.agents.tools.customer_payments import request_payment_link as _request_payment_link

customer_agent.tool(_get_store_products)
customer_agent.tool(_place_order)
customer_agent.tool(_request_payment_link)
