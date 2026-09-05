import logging
import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.models.agent_run import AgentPersona
from app.agents.base_agent import merchant_agent
from app.models.customer_connection import CustomerConnection
from app.models.order import OrderStatus, ActorType
from app.models.product import Product
from app.models.user import User
from app.repositories import (
    audit_log_repository,
    order_repository,
    customer_connection_repository,
    product_repository,
)
from app.schemas.order import OrderItemCreate
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant, lock_db
from app.agents.tools.customers import resolve_customer

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def create_order(
    ctx: RunContext[MerchantAgentDeps],
    customer_name: str | None = None,
    customer_id: str | None = None,
    items: list[dict] = None,
    price_type: str = "selling",
) -> str:
    """Create an order for a customer. Specify customer_name and items.

    NEVER ask the merchant for a UUID — pass customer_name and the tool resolves it.
    `items` is a list of dicts: [{"product_name": "Parle G", "quantity": 2}].
    Pass `price_type="cost"` for wholesale/cost-price orders.
    """
    if items is None or len(items) == 0:
        return "No items supplied. Pass a list of items like [{\"product_name\": \"rice\", \"quantity\": 1}]."

    target_name = customer_name or (ctx.deps.target_customer_name if not customer_id else str(customer_id)) or "default"
    items_sig = tuple(sorted(
        (str(it.get("product_name", "")).lower().strip(), it.get("quantity", 1))
        for it in items
    ))
    order_fingerprint = (target_name.lower().strip(), items_sig)

    for prev in ctx.deps.created_orders:
        if prev.get("fingerprint") == order_fingerprint:
            return (
                f"ORDER_ALREADY_CREATED\n"
                f"An identical order for {target_name} with these items was already created in this turn (Order #{prev.get('id', '')}). "
                f"DO NOT create duplicate orders. Confirm the order to the merchant."
            )

    try:
        merchant_id = _merchant_id(ctx)

        cust_uuid: uuid.UUID | None = None
        if not customer_id and not customer_name:
            if ctx.deps.target_customer_name:
                customer_name = ctx.deps.target_customer_name
            elif ctx.deps.target_customer_id:
                customer_id = str(ctx.deps.target_customer_id)

        is_customer = False

        if customer_id:
            cust_uuid = uuid.UUID(str(customer_id))
        elif customer_name:
            resolved = await resolve_customer(ctx, customer_name)
            like_term = f"%{customer_name.strip()}%"
            stmt = (
                select(CustomerConnection)
                .join(User, User.id == CustomerConnection.customer_id)
                .where(
                    CustomerConnection.merchant_id == merchant_id,
                    User.full_name.ilike(like_term),
                )
                .options(selectinload(CustomerConnection.customer))
                .limit(1)
            )
            conn = (await ctx.deps.db.execute(stmt)).scalars().first()
            if not conn:
                return (
                    f"Could not find a connected customer named '{customer_name}'. "
                    f"Ask the merchant to confirm the spelling, or call get_recent_customers "
                    f"to list everyone. Do NOT ask for a UUID — the merchant does not know UUIDs."
                )
            cust_uuid = conn.customer_id
        else:
            return "Either customer_name or customer_id is required. Prefer customer_name — the merchant does not know UUIDs."

        conn_id = ctx.deps.target_customer_connection_id
        if not conn_id:
            conn = await customer_connection_repository.get_or_create_connection(
                db=ctx.deps.db,
                merchant_id=merchant_id,
                customer_id=cust_uuid,
            )
            conn_id = conn.id

        order_items: list[OrderItemCreate] = []
        unresolved: list[str] = []
        for raw in items:
            qty = int(raw.get("quantity", 1))
            if qty < 1:
                return f"Quantity must be >= 1 for item {raw}"

            unit_price = raw.get("unit_price_snapshot") if not is_customer else None
            prod_id_raw = raw.get("product_id")
            prod_name = raw.get("product_name") or raw.get("name")
            use_cost = False if is_customer else (
                raw.get("price_type") == "cost"
                or raw.get("use_cost_price") is True
                or str(price_type).lower() in ("cost", "wholesale", "cost_price")
            )

            product_id_uuid: uuid.UUID | None = None
            if prod_id_raw:
                try:
                    product_id_uuid = uuid.UUID(str(prod_id_raw))
                except (ValueError, TypeError):
                    pass
                if unit_price is None and product_id_uuid:
                    p = await product_repository.get_by_id(ctx.deps.db, product_id_uuid, merchant_id)
                    if p:
                        unit_price = float(p.cost_price if use_cost else p.selling_price)
                        if not prod_name:
                            prod_name = p.product_name
            elif prod_name and unit_price is None:
                stmt = (
                    select(Product)
                    .where(
                        Product.merchant_id == merchant_id,
                        Product.is_active.is_(True),
                        Product.product_name.ilike(f"%{prod_name.strip()}%"),
                    )
                    .limit(1)
                )
                p = (await ctx.deps.db.execute(stmt)).scalars().first()
                if p:
                    unit_price = float(p.cost_price if use_cost else p.selling_price)
                    product_id_uuid = p.id
                    prod_name = p.product_name
                else:
                    unresolved.append(prod_name)

            if unit_price is None:
                if is_customer:
                    return f"Product '{prod_name}' is not found in the store catalog or currently unavailable."
                return (
                    f"I couldn't find '{prod_name}' in your catalog and no price was given. "
                    f"Either add the product first with add_product, or tell me the price to "
                    f"use for this order. (Other items were resolved fine.)"
                )

            order_items.append(
                OrderItemCreate(
                    product_id=product_id_uuid,
                    product_name_snapshot=str(prod_name),
                    quantity=qty,
                    unit_price_snapshot=Decimal(str(unit_price)),
                )
            )

        total_amount = sum(
            (it.quantity * it.unit_price_snapshot for it in order_items),
            Decimal("0.00"),
        )

        actor = ActorType.customer if is_customer else ActorType.ai_agent
        order = await order_repository.create_order(
            db=ctx.deps.db,
            merchant_id=merchant_id,
            customer_id=cust_uuid,
            customer_connection_id=conn_id,
            items=order_items,
            total_amount=total_amount,
            paid_amount=Decimal("0.00"),
            status=OrderStatus.unpaid,
            changed_by=actor,
            reason="Order placed via customer store chat" if is_customer else "Order created by MerchantAgent",
        )

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="order.created",
            entity_type="order",
            entity_id=str(order.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={
                "customer_id": str(cust_uuid),
                "total_amount": str(total_amount),
                "item_count": len(order_items),
                "actor": actor.value,
            },
        )
        await ctx.deps.db.commit()
        ctx.deps.created_orders.append({
            "fingerprint": order_fingerprint,
            "id": str(order.id),
            "customer_name": target_name,
            "total": float(total_amount),
            "status": order.status.value,
        })

        item_lines = "\n".join(
            f"- {it.product_name_snapshot} x{it.quantity} @ ₹{it.unit_price_snapshot:.2f} = ₹{(it.quantity * it.unit_price_snapshot):.2f}"
            for it in order_items
        )
        if is_customer:
            return (
                f"Order created successfully for {target_name}.\n"
                f"ORDER_ID: {order.id}\n"
                f"STATUS: {order.status.value}\n"
                f"TOTAL: ₹{total_amount:.2f}\n"
                f"ITEMS:\n{item_lines}\n"
                f"Now generate the payment link for this order so the customer can pay."
            )
        return (
            f"Order created.\n"
            f"ORDER_ID: {order.id}\n"
            f"STATUS: {order.status.value}\n"
            f"TOTAL: ₹{total_amount:.2f}\n"
            f"ITEMS:\n{item_lines}\n"
            f"Ask the merchant if they want a payment link for this order."
        )
    except Exception as e:
        logger.error("Error in create_order: %s", e, exc_info=True)
        return f"Failed to create order: {str(e)}"


@merchant_agent.tool
async def update_order_status(
    ctx: RunContext[MerchantAgentDeps],
    status: str = "paid",
    order_id: str | None = None,
    customer_name: str | None = None,
    paid_amount: float | None = None,
    total_amount: float | None = None,
    reason: str | None = None,
) -> str:
    """Update or change an existing order's status (e.g. 'paid', 'cancelled', 'unpaid'), paid amount, or total.

    Call this whenever the merchant asks to:
    - "change order #123 to paid", "mark order as paid", "order is settled", "mark Rahul's order as paid"
    - "change order status to cancelled", "cancel order for Rahul", "cancel order #456"
    - "update order"
    You can pass `order_id` (full UUID or short 8-char ID with or without #) or `customer_name`. NEVER demand a UUID from the merchant!
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)

        st_clean = status.strip().lower()
        target_status: OrderStatus
        if st_clean in ("paid", "completed", "success", "cleared", "delivered", "fulfilled"):
            target_status = OrderStatus.paid
        elif st_clean in ("cancelled", "canceled", "void", "refunded", "returned"):
            target_status = OrderStatus.cancelled
        elif st_clean in ("unpaid", "pending"):
            target_status = OrderStatus.unpaid
        else:
            try:
                target_status = OrderStatus(st_clean)
            except ValueError:
                return f"Invalid order status '{status}'. Valid options: paid, unpaid, cancelled."

        order = None
        clean_id = str(order_id).replace("#", "").strip() if order_id else None

        if clean_id:
            try:
                oid = uuid.UUID(clean_id)
                order = await order_repository.get_by_id(ctx.deps.db, oid, merchant_id)
            except (ValueError, AttributeError):
                pass

            if not order and len(clean_id) >= 4:
                from sqlalchemy import cast, String
                stmt = (
                    select(Order)
                    .options(*order_repository.order_eager_options())
                    .where(
                        Order.merchant_id == merchant_id,
                        cast(Order.id, String).ilike(f"{clean_id}%"),
                    )
                    .order_by(Order.created_at.desc())
                    .limit(1)
                )
                order = (await ctx.deps.db.execute(stmt)).scalars().first()

            if not order and not customer_name:
                customer_name = clean_id

        if not order and customer_name:
            orders = await order_repository.list_by_merchant(
                db=ctx.deps.db,
                merchant_id=merchant_id,
                search=customer_name.strip(),
                limit=1,
            )
            if orders:
                order = orders[0]

        if not order and not order_id and not customer_name:
            orders = await order_repository.list_by_merchant(
                db=ctx.deps.db,
                merchant_id=merchant_id,
                limit=1,
            )
            if orders:
                order = orders[0]

        if not order:
            ident = customer_name or order_id or "recent"
            return f"Could not find an order for '{ident}'. Check customer name or list orders."

        effective_paid_amount: Decimal | None = None
        if paid_amount is not None:
            effective_paid_amount = Decimal(str(paid_amount))
        elif target_status == OrderStatus.paid:
            effective_paid_amount = order.total_amount

        if total_amount is not None:
            order.total_amount = Decimal(str(total_amount))

        updated_order = await order_repository.update_order(
            db=ctx.deps.db,
            order=order,
            new_status=target_status,
            paid_amount=effective_paid_amount,
            changed_by=ActorType.ai_agent,
            reason=reason or f"Status updated to {target_status.value} by MerchantAgent",
        )
        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="order.updated",
            entity_type="order",
            entity_id=str(updated_order.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={
                "previous_status": order.status.value,
                "new_status": target_status.value,
                "paid_amount": str(updated_order.paid_amount),
            },
        )
        await ctx.deps.db.commit()

        cust_name = updated_order.customer.full_name if updated_order.customer else "Customer"
        return (
            f"ORDER_UPDATED\n"
            f"ORDER_ID: {updated_order.id}\n"
            f"CUSTOMER: {cust_name}\n"
            f"STATUS: {updated_order.status.value}\n"
            f"TOTAL: ₹{updated_order.total_amount:.2f}\n"
            f"PAID_AMOUNT: ₹{updated_order.paid_amount:.2f}"
        )
    except Exception as e:
        logger.error("Error in update_order_status: %s", e, exc_info=True)
        return f"Failed to update order status: {str(e)}"


@merchant_agent.tool
async def update_order(
    ctx: RunContext[MerchantAgentDeps],
    order_id: str | None = None,
    customer_name: str | None = None,
    status: str = "paid",
    paid_amount: float | None = None,
    total_amount: float | None = None,
    reason: str | None = None,
) -> str:
    """Update or change an existing order (status, payment, total). Alias for update_order_status."""
    return await update_order_status(
        ctx=ctx,
        status=status,
        order_id=order_id,
        customer_name=customer_name,
        paid_amount=paid_amount,
        total_amount=total_amount,
        reason=reason,
    )


@merchant_agent.tool
async def list_orders(
    ctx: RunContext[MerchantAgentDeps],
    status: str | None = None,
    customer_name: str | None = None,
    limit: int = 5,
) -> str:
    """List recent store orders. Can filter by status ('unpaid', 'paid', 'cancelled') or customer name."""
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            merchant_id = _merchant_id(ctx)
            st_filter = None
            if status:
                try:
                    st_filter = OrderStatus(status.strip().lower())
                except ValueError:
                    pass

            orders = await order_repository.list_by_merchant(
                db=ctx.deps.db,
                merchant_id=merchant_id,
                status=st_filter,
                search=customer_name,
                limit=limit,
            )

            if not orders:
                return "No orders found matching the criteria."

            lines = [
                "| Order ID | Customer | Items | Total | Status |",
                "| :--- | :--- | :--- | :--- | :--- |",
            ]
            for o in orders:
                cname = o.customer.full_name if o.customer else "Walk-in"
                items_str = ", ".join(f"{it.product_name_snapshot} x{it.quantity}" for it in (o.items or []))
                short_id = str(o.id)[:8]
                status_label = "Paid" if o.status == OrderStatus.paid else "Pending"
                lines.append(
                    f"| #{short_id} | {cname} | {items_str} | ₹{o.total_amount:.2f} | {status_label} |"
                )
            return "\n".join(lines)
    except Exception as e:
        logger.error("Error in list_orders: %s", e, exc_info=True)
        return f"Failed to list orders: {str(e)}"
