import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.customer_connection import CustomerConnection, ConnectionStatus

async def get_by_id(
    db: AsyncSession,
    connection_id: uuid.UUID | str,
    merchant_id: uuid.UUID | str | None = None,
) -> CustomerConnection | None:
    c_id = uuid.UUID(str(connection_id)) if isinstance(connection_id, str) else connection_id
    query = (
        select(CustomerConnection)
        .options(selectinload(CustomerConnection.customer))
        .where(CustomerConnection.id == c_id)
    )
    if merchant_id is not None:
        m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
        query = query.where(CustomerConnection.merchant_id == m_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_by_merchant_and_customer(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
    customer_id: uuid.UUID | str,
) -> CustomerConnection | None:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    c_id = uuid.UUID(str(customer_id)) if isinstance(customer_id, str) else customer_id
    query = (
        select(CustomerConnection)
        .options(selectinload(CustomerConnection.customer))
        .where(
            CustomerConnection.merchant_id == m_id,
            CustomerConnection.customer_id == c_id,
        )
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_by_merchant(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
    status: ConnectionStatus | None = None,
    cursor: datetime | None = None,
    limit: int = 30,
) -> list[CustomerConnection]:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = (
        select(CustomerConnection)
        .options(selectinload(CustomerConnection.customer))
        .where(CustomerConnection.merchant_id == m_id)
    )

    if status is not None:
        query = query.where(CustomerConnection.status == status)

    if cursor is not None:
        query = query.where(CustomerConnection.updated_at < cursor)

    query = query.order_by(CustomerConnection.updated_at.desc()).limit(limit + 1)
    result = await db.execute(query)
    return list(result.scalars().all())

async def create_connection(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    customer_id: uuid.UUID,
    status: ConnectionStatus = ConnectionStatus.pending,
) -> CustomerConnection:
    connection = CustomerConnection(
        merchant_id=merchant_id,
        customer_id=customer_id,
        status=status,
    )
    db.add(connection)
    await db.flush()
    await db.refresh(connection)

    loaded = await get_by_id(db, connection.id)
    return loaded if loaded is not None else connection

async def get_or_create_connection(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    customer_id: uuid.UUID,
) -> CustomerConnection:
    existing = await get_by_merchant_and_customer(db, merchant_id, customer_id)
    if existing:
        return existing
    return await create_connection(
        db=db,
        merchant_id=merchant_id,
        customer_id=customer_id,
        status=ConnectionStatus.pending,
    )
