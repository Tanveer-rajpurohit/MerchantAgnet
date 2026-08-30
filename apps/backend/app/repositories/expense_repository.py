import uuid
from decimal import Decimal
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.schemas.onboarding import OnboardingExpenseRow

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
    return expense

async def bulk_replace_expenses(
    db: AsyncSession,
    merchant_id: uuid.UUID,
    expenses: list[OnboardingExpenseRow],
) -> int:
    await db.execute(
        delete(Expense).where(Expense.merchant_id == merchant_id)
    )

    count = 0
    for item in expenses:
        if not item.category.strip():
            continue
        expense = Expense(
            merchant_id=merchant_id,
            category=item.category.strip(),
            amount=item.amount,
            due_on=item.due_on.strip() if item.due_on else "1st of month",
            notes=item.notes.strip() if item.notes else None,
        )
        db.add(expense)
        count += 1

    await db.flush()
    return count
