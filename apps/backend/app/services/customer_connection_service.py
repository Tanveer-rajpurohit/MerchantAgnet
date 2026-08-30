import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.customer_connection import CustomerConnection, ConnectionStatus
from app.repositories import customer_connection_repository
from app.schemas.customer import (
    CustomerConnectionCreateRequest,
    CustomerConnectionResponse,
)

def to_response(connection: CustomerConnection) -> CustomerConnectionResponse:
    customer = connection.customer
    return CustomerConnectionResponse(
        id=connection.id,
        merchant_id=connection.merchant_id,
        customer_id=connection.customer_id,
        customer_name=customer.full_name if customer else "Unknown",
        customer_phone=customer.phone_number if customer else None,
        customer_email=customer.email if customer else "",
        customer_profile_picture=customer.profile_picture if customer else None,
        status=connection.status,
        messages_used=connection.messages_used,
        total_spent=connection.total_spent,
        connected_at=connection.connected_at,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )

async def list_merchant_customers(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    status_filter: ConnectionStatus | None = None,
) -> list[CustomerConnectionResponse]:
    connections = await customer_connection_repository.list_by_merchant(
        db=db,
        merchant_id=merchant_id,
        status=status_filter,
    )
    return [to_response(c) for c in connections]

async def get_connection_by_id(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    connection_id: uuid.UUID,
) -> CustomerConnectionResponse:
    connection = await customer_connection_repository.get_by_id(
        db=db,
        connection_id=connection_id,
        merchant_id=merchant_id,
    )
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer connection not found",
        )
    return to_response(connection)

async def create_connection(
    db: AsyncSession,
    current_user: User,
    payload: CustomerConnectionCreateRequest,
) -> CustomerConnectionResponse:
    if current_user.role == UserRole.customer:
        target_customer_id = current_user.id
    elif payload.customer_id:
        target_customer_id = payload.customer_id
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="customer_id is required",
        )

    connection = await customer_connection_repository.get_or_create_connection(
        db=db,
        merchant_id=payload.merchant_id,
        customer_id=target_customer_id,
    )
    return to_response(connection)
