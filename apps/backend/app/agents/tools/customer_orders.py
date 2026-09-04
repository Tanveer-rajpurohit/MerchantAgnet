import logging
import uuid
from decimal import Decimal

from sqlalchemy import select
from pydantic_ai import RunContext

from app.agents.customer_deps import CustomerAgentDeps
from app.models.order import OrderStatus, ActorType
from app.models.product import Product
from app.repositories import audit_log_repository, order_repository, customer_connection_repository
from app.schemas.order import OrderItemCreate

logger = logging.getLogger(__name__)


async def place_order(
    ctx: RunContext[CustomerAgentDeps],
    items: list[dict] | None = None,
) -> str:
    """Create an order for the customer at verified catalog prices.

    CRITICAL RULES:
    1. ONLY call this when the customer's CURRENT (latest) message explicitly asks to buy or order items (e.g. "I want to buy X", "Order 2 of Y", "place order", "yes create it").
    2. NEVER call this tool for inquiries or questions (e.g. "do you have razorpay?", "what is the price of rice?", "can I pay online?").
    3. NEVER create an order based solely on past conversation history without an explicit order command in the latest message.

    `items`: list of dicts, e.g. [{"product_name": "Parle G", "quantity": 2}].
    Each dict needs "product_name" and optionally "quantity" (defaults to 1).
    """
    if not items:
        return 'No items provided. Pass items like [{"product_name": "rice", "quantity": 1}].'

    if not ctx.deps.customer_id:
        return "Please log in to place an order."

    items_sig = tuple(sorted(
        (str(it.get("product_name", "")).lower().strip(), it.get("quantity", 1))
        for it in items
    ))
    order_fingerprint = (str(ctx.deps.customer_id), items_sig)

    for prev in ctx.deps.created_orders:
        if prev.get("fingerprint") == order_fingerprint:
            return (
                f"This order was already created in this chat turn (Order #{prev.get('id', '')}). "
                f"Total: ₹{prev.get('total', 0):.2f}. No duplicate needed."
            )

    try:
        merchant_id = ctx.deps.merchant_id

        conn_id = ctx.deps.connection_id
        if not conn_id:
            conn = await customer_connection_repository.get_or_create_connection(
                db=ctx.deps.db,
                merchant_id=merchant_id,
                customer_id=ctx.deps.customer_id,
            )
            conn_id = conn.id

        order_items: list[OrderItemCreate] = []
        for raw in items:
            qty = int(raw.get("quantity", 1))
            if qty < 1:
                return f"Quantity must be >= 1 for item {raw.get('product_name', '?')}."

            prod_name = raw.get("product_name") or raw.get("name")
            if not prod_name:
                return "Each item needs a 'product_name'."

            stmt = (
                select(Product)
                .where(
                    Product.merchant_id == merchant_id,
                    Product.is_active.is_(True),
                    Product.product_name.ilike(f"%{prod_name.strip()}%"),
                )
                .limit(1)
            )
            product = (await ctx.deps.db.execute(stmt)).scalars().first()

            if not product:
                return f"'{prod_name}' is not available in this store's catalog."

            order_items.append(
                OrderItemCreate(
                    product_id=product.id,
                    product_name_snapshot=product.product_name,
                    quantity=qty,
                    unit_price_snapshot=product.selling_price,
                )
            )

        total_amount = sum(
            (it.quantity * it.unit_price_snapshot for it in order_items),
            Decimal("0.00"),
        )

        order = await order_repository.create_order(
            db=ctx.deps.db,
            merchant_id=merchant_id,
            customer_id=ctx.deps.customer_id,
            customer_connection_id=conn_id,
            items=order_items,
            total_amount=total_amount,
            paid_amount=Decimal("0.00"),
            status=OrderStatus.unpaid,
            changed_by=ActorType.customer,
            reason="Order placed by customer via store chat",
        )

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="order.created",
            entity_type="order",
            entity_id=str(order.id),
            merchant_id=merchant_id,
            user_id=ctx.deps.customer_id,
            details={
                "customer_id": str(ctx.deps.customer_id),
                "total_amount": str(total_amount),
                "item_count": len(order_items),
                "actor": "customer",
            },
        )
        await ctx.deps.db.commit()

        ctx.deps.created_orders.append({
            "fingerprint": order_fingerprint,
            "id": str(order.id),
            "total": float(total_amount),
        })

        item_lines = "\n".join(
            f"- {it.product_name_snapshot} x{it.quantity} @ ₹{it.unit_price_snapshot:.2f}"
            for it in order_items
        )
        return (
            f"Order created!\n"
            f"ORDER_ID: {order.id}\n"
            f"TOTAL: ₹{total_amount:.2f}\n"
            f"ITEMS:\n{item_lines}\n"
            f"Now generate the payment link so the customer can pay."
        )
    except Exception as e:
        logger.error("Error in place_order: %s", e, exc_info=True)
        return f"Failed to create order: {e}"
