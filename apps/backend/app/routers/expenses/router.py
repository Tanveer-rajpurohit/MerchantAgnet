import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services import expense_service
from app.schemas.expense import (
    ExpenseCreateRequest,
    ExpenseUpdateRequest,
    ExpenseBatchRequest,
    ExpenseResponse,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get(
    "",
    response_model=list[ExpenseResponse],
)
async def list_expenses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    return await expense_service.list_expenses(db, current_user.merchant_profile.id)

@router.put(
    "/batch",
    response_model=list[ExpenseResponse],
)
async def batch_replace_expenses(
    payload: ExpenseBatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    return await expense_service.batch_replace_expenses(db, current_user.merchant_profile.id, payload)

@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
async def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    return await expense_service.get_expense_by_id(db, current_user.merchant_profile.id, expense_id)

@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_expense(
    payload: ExpenseCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    return await expense_service.create_expense(db, current_user.merchant_profile.id, payload)

@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
    status_code=status.HTTP_200_OK,
)
async def update_expense(
    expense_id: uuid.UUID,
    payload: ExpenseUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    return await expense_service.update_expense(db, current_user.merchant_profile.id, expense_id, payload)

@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.merchant_profile:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only merchants can access expenses")
    await expense_service.delete_expense(db, current_user.merchant_profile.id, expense_id)
