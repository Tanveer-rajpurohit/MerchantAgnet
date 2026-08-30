import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import expense_repository
from app.schemas.expense import (
    ExpenseCreateRequest,
    ExpenseUpdateRequest,
    ExpenseBatchRequest,
    ExpenseResponse,
)

async def list_expenses(db: AsyncSession, merchant_id: uuid.UUID) -> list[ExpenseResponse]:
    expenses = await expense_repository.list_by_merchant(db, merchant_id)
    return [ExpenseResponse.model_validate(e) for e in expenses]

async def get_expense_by_id(db: AsyncSession, merchant_id: uuid.UUID, expense_id: uuid.UUID) -> ExpenseResponse:
    expense = await expense_repository.get_by_id(db, expense_id, merchant_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    return ExpenseResponse.model_validate(expense)

async def create_expense(db: AsyncSession, merchant_id: uuid.UUID, payload: ExpenseCreateRequest) -> ExpenseResponse:
    expense = await expense_repository.create_expense(
        db=db,
        merchant_id=merchant_id,
        category=payload.category,
        amount=payload.amount,
        due_on=payload.due_on,
        notes=payload.notes,
    )
    return ExpenseResponse.model_validate(expense)

async def update_expense(db: AsyncSession, merchant_id: uuid.UUID, expense_id: uuid.UUID, payload: ExpenseUpdateRequest) -> ExpenseResponse:
    expense = await expense_repository.get_by_id(db, expense_id, merchant_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    await db.flush()
    return ExpenseResponse.model_validate(expense)

async def batch_replace_expenses(db: AsyncSession, merchant_id: uuid.UUID, payload: ExpenseBatchRequest) -> list[ExpenseResponse]:
    await expense_repository.bulk_replace_expenses(
        db=db,
        merchant_id=merchant_id,
        expenses=payload.expenses,
    )
    expenses = await expense_repository.list_by_merchant(db, merchant_id)
    return [ExpenseResponse.model_validate(e) for e in expenses]

async def delete_expense(db: AsyncSession, merchant_id: uuid.UUID, expense_id: uuid.UUID) -> None:
    expense = await expense_repository.get_by_id(db, expense_id, merchant_id)
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
    await expense_repository.delete_expense(db, expense)
