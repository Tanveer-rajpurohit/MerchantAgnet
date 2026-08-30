import uuid
from decimal import Decimal
from typing import Sequence
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreateRequest
from app.schemas.onboarding import OnboardingExpenseRow

async def get_by_id(
    db: AsyncSession,
    expense_id: uuid.UUID | str,
    merchant_id: uuid.UUID | str,
) -> Expense | None:
    e_id = uuid.UUID(str(expense_id)) if isinstance(expense_id, str) else expense_id
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = select(Expense).where(
        Expense.id == e_id,
        Expense.merchant_id == m_id,
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def list_by_merchant(
    db: AsyncSession,
    merchant_id: uuid.UUID | str,
) -> list[Expense]:
    m_id = uuid.UUID(str(merchant_id)) if isinstance(merchant_id, str) else merchant_id
    query = select(Expense).where(Expense.merchant_id == m_id)
    result = await db.execute(query)
    return list(result.scalars().all())

async def create_expense(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    category: str,
    amount: Decimal,
    due_on: str = "1st of month",
    notes: str | None = None,
) -> Expense:
    expense = Expense(
        merchant_id=merchant_id,
        category=category.strip(),
        amount=amount,
        due_on=due_on.strip() if due_on else "1st of month",
        notes=notes.strip() if notes else None,
    )
    db.add(expense)
    await db.flush()
    await db.refresh(expense)
    return expense

async def bulk_replace_expenses(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    expenses: Sequence[OnboardingExpenseRow | ExpenseCreateRequest],
) -> int:
    await db.execute(
        delete(Expense).where(Expense.merchant_id == merchant_id)
    )

    count = 0
    for item in expenses:
        if not item.category.strip():
            continue
        due_on_val = getattr(item, "due_on", None)
        expense = Expense(
            merchant_id=merchant_id,
            category=item.category.strip(),
            amount=item.amount,
            due_on=due_on_val.strip() if due_on_val else "1st of month",
            notes=item.notes.strip() if item.notes else None,
        )
        db.add(expense)
        count += 1

    await db.flush()
    return count

async def delete_expense(
    db: AsyncSession,
    expense: Expense,
) -> None:
    await db.delete(expense)
    await db.flush()
