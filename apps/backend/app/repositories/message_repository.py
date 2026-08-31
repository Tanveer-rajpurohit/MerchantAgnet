import uuid
from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.conversation import Conversation, Message, SenderType, SendStatus
from app.models.customer_connection import CustomerConnection

async def list_messages_by_connection(
    db: AsyncSession,
    customer_connection_id: uuid.UUID | str,
    cursor: datetime | None = None,
    limit: int = 30,
) -> list[Message]:
    conn_id = uuid.UUID(str(customer_connection_id)) if isinstance(customer_connection_id, str) else customer_connection_id
    query = (
        select(Message)
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(Conversation.customer_connection_id == conn_id)
    )

    if cursor is not None:
        query = query.where(Message.created_at < cursor)

    query = query.order_by(Message.created_at.desc()).limit(limit + 1)
    result = await db.execute(query)
    return list(result.scalars().all())

async def save_message_to_connection(
    db: AsyncSession,
    customer_connection_id: uuid.UUID | str,
    sender_type: SenderType,
    content: str,
    status: SendStatus = SendStatus.sent,
) -> Message:
    conn_id = uuid.UUID(str(customer_connection_id)) if isinstance(customer_connection_id, str) else customer_connection_id
    query = select(Conversation).where(Conversation.customer_connection_id == conn_id)
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(customer_connection_id=conn_id)
        db.add(conversation)
        await db.flush()

    message = Message(
        conversation_id=conversation.id,
        sender_type=sender_type,
        content=content.strip(),
        status=status,
    )
    db.add(message)

    conn_query = select(CustomerConnection).where(CustomerConnection.id == conn_id)
    conn_result = await db.execute(conn_query)
    connection = conn_result.scalar_one_or_none()
    if connection:
        connection.messages_used = (connection.messages_used or 0) + 1
        connection.updated_at = func.now()

    conversation.updated_at = func.now()

    await db.flush()
    await db.refresh(message)
    return message
