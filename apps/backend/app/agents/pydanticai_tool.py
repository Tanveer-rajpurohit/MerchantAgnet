"""
PydanticAI tool registry for the MerchantAgent.
  - catalog.py   : get_product_catalog, search_store_knowledge, add_product, update_product, delete_product
  - expenses.py  : record_expense, get_current_expenses, update_expense, delete_expense
  - customers.py : get_recent_customers, resolve_customer
  - orders.py    : create_order
  - payments.py  : create_payment_link, check_payment_status, list_payment_links
  - campaigns.py : create_campaign
  - audit.py     : get_audit_log
"""

from app.agents.base_agent import merchant_agent
from app.agents.tools.common import (
    _is_merchant,
    _merchant_id,
    _actor_user_id,
    _guard_merchant,
)
from app.agents.tools.catalog import (
    get_product_catalog,
    search_store_knowledge,
    add_product,
    update_product,
    delete_product,
)
from app.agents.tools.expenses import (
    record_expense,
    get_current_expenses,
    update_expense,
    delete_expense,
)
from app.agents.tools.customers import (
    get_recent_customers,
    resolve_customer,
    send_message_to_customer,
)
from app.agents.tools.orders import (
    create_order,
    update_order_status,
    list_orders,
)
from app.agents.tools.payments import (
    create_payment_link,
    check_payment_status,
    list_payment_links,
    _format_link_status,
)
from app.agents.tools.campaigns import (
    create_campaign,
)
from app.agents.tools.audit import (
    get_audit_log,
)
from app.agents.tools.analytics import (
    get_daily_collection,
    get_customer_udhaar_ledger,
    get_store_financial_report,
    get_store_earnings_analytics,
)

__all__ = [
    "merchant_agent",
    "_is_merchant",
    "_merchant_id",
    "_actor_user_id",
    "_guard_merchant",
    "get_product_catalog",
    "search_store_knowledge",
    "add_product",
    "update_product",
    "delete_product",
    "record_expense",
    "get_current_expenses",
    "update_expense",
    "delete_expense",
    "get_recent_customers",
    "resolve_customer",
    "send_message_to_customer",
    "create_order",
    "update_order_status",
    "list_orders",
    "create_payment_link",
    "check_payment_status",
    "list_payment_links",
    "_format_link_status",
    "create_campaign",
    "get_audit_log",
    "get_store_earnings_analytics",
]
