import logging
import uuid
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.customer_connection import CustomerConnection, ConnectionStatus
from app.models.conversation import Conversation, Message, SenderType, SendStatus
from app.models.user import User
from app.repositories import message_repository, audit_log_repository
from app.websockets.manager import manager
from app.agents.tools.common import _merchant_id, _guard_merchant, _actor_user_id

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def get_recent_customers(
    ctx: RunContext[MerchantAgentDeps],
    limit: int = 20,
) -> str:
    """Retrieve connected customers who have recently chatted or interacted with the store.

    Call this to see connected customers, their recent activity, contact details, and total spend.
    - limit: Maximum number of customers to return (default 20, max 50).
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        cap = max(1, min(int(limit), 50))
        merchant_id = _merchant_id(ctx)

        latest_msg = (
            select(
                Message.conversation_id,
                func.max(Message.created_at).label("last_msg_at"),
            )
            .group_by(Message.conversation_id)
            .subquery()
        )

        stmt = (
            select(CustomerConnection, latest_msg.c.last_msg_at)
            .join(Conversation, Conversation.customer_connection_id == CustomerConnection.id)
            .join(latest_msg, latest_msg.c.conversation_id == Conversation.id)
            .where(
                CustomerConnection.merchant_id == merchant_id,
                CustomerConnection.status == ConnectionStatus.connected,
            )
            .order_by(latest_msg.c.last_msg_at.desc())
            .limit(cap)
            .options(selectinload(CustomerConnection.customer))
        )
        rows = (await ctx.deps.db.execute(stmt)).all()

        if not rows:
            stmt_fallback = (
                select(CustomerConnection)
                .where(
                    CustomerConnection.merchant_id == merchant_id,
                    CustomerConnection.status == ConnectionStatus.connected,
                )
                .order_by(CustomerConnection.total_spent.desc().nullslast())
                .limit(cap)
                .options(selectinload(CustomerConnection.customer))
            )
            fallback_conns = (await ctx.deps.db.execute(stmt_fallback)).scalars().all()
            if not fallback_conns:
                return "No connected customers found for this store."
            lines = ["CONNECTION_ID | CUSTOMER_ID | NAME | PHONE | TOTAL_SPENT | LAST_ACTIVE"]
            for conn in fallback_conns:
                cust = conn.customer
                name = cust.full_name if cust else "Unknown"
                phone = cust.phone_number or "-" if cust else "-"
                spent = f"₹{conn.total_spent:.2f}" if conn.total_spent else "₹0.00"
                lines.append(
                    f"{conn.id} | {conn.customer_id} | {name} | {phone} | {spent} | n/a"
                )
            return "\n".join(lines)

        lines = ["CONNECTION_ID | CUSTOMER_ID | NAME | PHONE | TOTAL_SPENT | LAST_ACTIVE"]
        for conn, last_at in rows:
            cust = conn.customer
            name = cust.full_name if cust else "Unknown"
            phone = cust.phone_number or "-" if cust else "-"
            spent = f"₹{conn.total_spent:.2f}" if conn.total_spent else "₹0.00"
            lines.append(
                f"{conn.id} | {conn.customer_id} | {name} | {phone} | {spent} | "
                f"{last_at.isoformat() if last_at else 'n/a'}"
            )
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_recent_customers: %s", e, exc_info=True)
        return f"Error retrieving recent customers: {str(e)}"


@merchant_agent.tool
async def resolve_customer(
    ctx: RunContext[MerchantAgentDeps],
    query: str,
) -> str:
    """Find a customer by name, phone, or email. Returns matching connections with their IDs.

    ALWAYS call this when the merchant mentions a customer by name (e.g. "create an order
    for Rajesh") instead of asking the merchant for a UUID. The merchant does not know UUIDs.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        merchant_id = _merchant_id(ctx)
        term = query.strip()
        if not term:
            return "Empty query. Pass a name, phone, or email."

        like_term = f"%{term}%"
        stmt = (
            select(CustomerConnection)
            .join(User, User.id == CustomerConnection.customer_id)
            .where(
                CustomerConnection.merchant_id == merchant_id,
                or_(
                    User.full_name.ilike(like_term),
                    User.phone_number.ilike(like_term),
                    User.email.ilike(like_term),
                ),
            )
            .options(selectinload(CustomerConnection.customer))
            .limit(10)
        )
        conns = (await ctx.deps.db.execute(stmt)).scalars().all()

        if not conns:
            return (
                f"No customer matched '{term}'. Ask the merchant to confirm the spelling, "
                f"or call get_recent_customers to list everyone the merchant has chatted with."
            )

        lines = ["CONNECTION_ID | CUSTOMER_ID | NAME | PHONE | EMAIL | STATUS"]
        for conn in conns:
            cust = conn.customer
            if cust is None:
                continue
            lines.append(
                f"{conn.id} | {conn.customer_id} | {cust.full_name} | "
                f"{cust.phone_number or '-'} | {cust.email} | {conn.status.value}"
            )
        if len(conns) == 1:
            lines.append("\n(Single match — safe to use this customer directly.)")
        else:
            lines.append(f"\n({len(conns)} matches — if the merchant said a name, pick the most likely one.)")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in resolve_customer: %s", e, exc_info=True)
        return f"Error resolving customer: {str(e)}"


@merchant_agent.tool
async def send_message_to_customer(
    ctx: RunContext[MerchantAgentDeps],
    message: str,
    customer_name: str | None = None,
    customer_id: str | None = None,
    customer_connection_id: str | None = None,
    customer_connection_ids: list[str] | None = None,
) -> str:
    """Send a direct message, checkout/payment link, or note to connected customer(s).

    The message is saved to the customer's chat conversation and broadcast in real-time over WebSockets.
    - If sending to a specific customer, pass `customer_name` (e.g. "Rajesh", "Tanveer") or `customer_id` or `customer_connection_id`.
    - If multiple customers are attached or `customer_connection_ids` is provided, automatically broadcasts to all of them at once!
    - Never ask the merchant for UUIDs — look up the customer by name or use attached customers.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    msg_clean = message.strip()
    if not msg_clean:
        return "Message content cannot be empty."

    try:
        merchant_id = _merchant_id(ctx)

        # Multi-target check: explicit list OR multiple customers attached in context
        target_cids: list[str] = []
        if customer_connection_ids and len(customer_connection_ids) > 1:
            target_cids = customer_connection_ids
        elif (
            not customer_name
            and not customer_id
            and not customer_connection_id
            and ctx.deps.target_customers
            and len(ctx.deps.target_customers) > 1
        ):
            target_cids = [
                str(c["customer_connection_id"])
                for c in ctx.deps.target_customers
                if c.get("customer_connection_id")
            ]

        # Smart deduplication: check if this EXACT message was already sent to this EXACT recipient in this turn
        target_ident = tuple(sorted(target_cids)) if target_cids else (
            customer_name or customer_id or customer_connection_id or ctx.deps.target_customer_name or "default"
        )
        msg_fingerprint = (str(target_ident).lower().strip(), msg_clean.lower().strip())

        for prev in ctx.deps.sent_messages:
            if prev.get("fingerprint") == msg_fingerprint:
                logger.info("send_message_to_customer duplicate message detected; skipping send")
                return (
                    f"MESSAGE_ALREADY_SENT\n"
                    f"This exact message has already been delivered to the customer in this turn. "
                    f"DO NOT send duplicate messages. Confirm the action to the merchant."
                )

        if target_cids:
            parsed_ids = []
            for cid in target_cids:
                try:
                    parsed_ids.append(uuid.UUID(str(cid).strip()))
                except (ValueError, AttributeError):
                    pass

            if parsed_ids:
                stmt = (
                    select(CustomerConnection)
                    .where(
                        CustomerConnection.id.in_(parsed_ids),
                        CustomerConnection.merchant_id == merchant_id,
                    )
                    .options(selectinload(CustomerConnection.customer))
                )
                conns = (await ctx.deps.db.execute(stmt)).scalars().all()
                if conns:
                    sent_names = []
                    for conn in conns:
                        saved_msg = await message_repository.save_message_to_connection(
                            db=ctx.deps.db,
                            customer_connection_id=conn.id,
                            sender_type=SenderType.merchant,
                            content=msg_clean,
                            status=SendStatus.sent,
                        )
                        msg_payload = {
                            "id": str(saved_msg.id),
                            "conversation_id": str(saved_msg.conversation_id),
                            "sender_type": saved_msg.sender_type.value,
                            "content": saved_msg.content,
                            "status": saved_msg.status.value,
                            "created_at": saved_msg.created_at.isoformat(),
                        }
                        await manager.broadcast(
                            connection_id=conn.id,
                            message={"type": "new_message", "message": msg_payload},
                        )
                        cname = conn.customer.full_name if conn.customer else "Customer"
                        sent_names.append(cname)
                        await audit_log_repository.log_action(
                            db=ctx.deps.db,
                            action="customer.message_sent",
                            entity_type="customer_connection",
                            entity_id=str(conn.id),
                            merchant_id=merchant_id,
                            user_id=_actor_user_id(ctx),
                            details={"customer_name": cname, "message_preview": msg_clean[:100]},
                        )
                    await ctx.deps.db.commit()
                    ctx.deps.sent_messages.append({
                        "fingerprint": msg_fingerprint,
                        "content": msg_clean,
                        "recipient_count": len(sent_names),
                        "recipients": sent_names,
                    })
                    return f"Successfully sent message to {len(sent_names)} customers ({', '.join(sent_names)}): \"{msg_clean}\""

        # Single customer resolution
        conn = None

        # Fallback to context's attached customer if not explicitly provided
        if not customer_connection_id and ctx.deps.target_customer_connection_id:
            customer_connection_id = str(ctx.deps.target_customer_connection_id)
        if not customer_id and ctx.deps.target_customer_id:
            customer_id = str(ctx.deps.target_customer_id)
        if not customer_name and ctx.deps.target_customer_name:
            customer_name = ctx.deps.target_customer_name

        # 1. Resolve by customer_connection_id if given
        if customer_connection_id:
            try:
                cid = uuid.UUID(str(customer_connection_id).strip())
                stmt = (
                    select(CustomerConnection)
                    .where(
                        CustomerConnection.id == cid,
                        CustomerConnection.merchant_id == merchant_id,
                    )
                    .options(selectinload(CustomerConnection.customer))
                )
                conn = (await ctx.deps.db.execute(stmt)).scalars().first()
            except (ValueError, AttributeError):
                pass

        # 2. Resolve by customer_id
        if not conn and customer_id:
            try:
                uid = uuid.UUID(str(customer_id).strip())
                stmt = (
                    select(CustomerConnection)
                    .where(
                        CustomerConnection.customer_id == uid,
                        CustomerConnection.merchant_id == merchant_id,
                    )
                    .options(selectinload(CustomerConnection.customer))
                )
                conn = (await ctx.deps.db.execute(stmt)).scalars().first()
            except (ValueError, AttributeError):
                pass

        # 3. Resolve by customer_name
        if not conn and customer_name:
            term = customer_name.strip()
            like_term = f"%{term}%"
            stmt = (
                select(CustomerConnection)
                .join(User, User.id == CustomerConnection.customer_id)
                .where(
                    CustomerConnection.merchant_id == merchant_id,
                    or_(
                        User.full_name.ilike(like_term),
                        User.phone_number.ilike(like_term),
                        User.email.ilike(like_term),
                    ),
                )
                .options(selectinload(CustomerConnection.customer))
                .limit(1)
            )
            conn = (await ctx.deps.db.execute(stmt)).scalars().first()

        if not conn:
            ident = customer_name or customer_id or customer_connection_id or "the customer"
            return (
                f"Could not find a connected customer matching '{ident}'. "
                f"Call get_recent_customers to list connected customers."
            )

        # 4. Save message to connection
        saved_msg = await message_repository.save_message_to_connection(
            db=ctx.deps.db,
            customer_connection_id=conn.id,
            sender_type=SenderType.merchant,
            content=msg_clean,
            status=SendStatus.sent,
        )

        # 5. Broadcast to WebSockets
        msg_payload = {
            "id": str(saved_msg.id),
            "conversation_id": str(saved_msg.conversation_id),
            "sender_type": saved_msg.sender_type.value,
            "content": saved_msg.content,
            "status": saved_msg.status.value,
            "created_at": saved_msg.created_at.isoformat(),
        }
        await manager.broadcast(
            connection_id=conn.id,
            message={"type": "new_message", "message": msg_payload},
        )

        # 6. Audit log
        cust_name = conn.customer.full_name if conn.customer else "Customer"
        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="customer.message_sent",
            entity_type="customer_connection",
            entity_id=str(conn.id),
            merchant_id=merchant_id,
            user_id=_actor_user_id(ctx),
            details={"customer_name": cust_name, "message_preview": msg_clean[:100]},
        )
        await ctx.deps.db.commit()
        ctx.deps.sent_messages.append({
            "fingerprint": msg_fingerprint,
            "content": msg_clean,
            "recipient_count": 1,
            "recipients": [cust_name],
        })

        return f"Successfully sent message to {cust_name}: \"{msg_clean}\""
    except Exception as e:
        logger.error("Error in send_message_to_customer: %s", e, exc_info=True)
        return f"Failed to send message: {str(e)}"
