import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user, get_current_merchant
from app.models.user import User
from app.models.customer_connection import ConnectionStatus
from app.services import customer_connection_service
from app.schemas.customer import (
    CustomerConnectionCreateRequest,
    CustomerConnectionResponse,
)

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get(
    "",
    response_model=list[CustomerConnectionResponse],
)
async def list_customers(
    status_filter: ConnectionStatus | None = Query(None, alias="status"),
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not found",
        )
    return await customer_connection_service.list_merchant_customers(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        status_filter=status_filter,
    )

@router.get(
    "/{connection_id}",
    response_model=CustomerConnectionResponse,
)
async def get_customer(
    connection_id: uuid.UUID,
    current_user: User = Depends(get_current_merchant),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not found",
        )
    return await customer_connection_service.get_connection_by_id(
        db=db,
        merchant_id=current_user.merchant_profile.id,
        connection_id=connection_id,
    )

@router.post(
    "",
    response_model=CustomerConnectionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_connection(
    payload: CustomerConnectionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await customer_connection_service.create_connection(
        db=db,
        current_user=current_user,
        payload=payload,
    )
