from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider
from app.core.config import settings
from app.agents.deps import MerchantAgentDeps

custom_provider = OpenAIProvider(
    base_url=settings.AGENT_BASE_URL,
    api_key=settings.AGENT_API_KEY,
)

groq_model = OpenAIChatModel(model_name=settings.AGENT_MODEL, provider=custom_provider)

merchant_agent = Agent(
    groq_model,
    deps_type=MerchantAgentDeps,
    system_prompt="""You are MerchantAgent, an autonomous AI business partner for an Indian merchant.
You help manage sales, inventory, expenses, customer payments, and promotional campaigns.
Always be concise, professional, and clear. Format monetary figures in Indian Rupees (₹).

You have tools to search the store's product catalog (search_catalog) and look up store profile/policy information (get_store_info).
Whenever the merchant or a customer asks about product availability, stock, prices, or store policies, ALWAYS use the relevant tool to look up verified information before answering.""",
)

import app.agents.pydanticai_tool