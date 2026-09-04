import logging
import uuid
from decimal import Decimal

from sqlalchemy import select
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.expense import Expense
from app.repositories import audit_log_repository, expense_repository
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def record_expense(
    ctx: RunContext[MerchantAgentDeps],
    amount: float,
    category: str,
    description: str,
) -> str:
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        expense = Expense(
            merchant_id=_merchant_id(ctx),
            amount=Decimal(str(amount)),
            category=category.strip(),
            notes=description.strip(),
        )
        ctx.deps.db.add(expense)
        await ctx.deps.db.flush()

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="expense.created",
            entity_type="expense",
            entity_id=str(expense.id),
            merchant_id=_merchant_id(ctx),
            user_id=_actor_user_id(ctx),
            details={"amount": str(expense.amount), "category": expense.category},
        )
        await ctx.deps.db.commit()

        return (
            f"Expense recorded.\n"
            f"EXPENSE_ID: {expense.id}\n"
            f"Category: {category}\n"
            f"Amount: ₹{amount:.2f}\n"
            f"Description: {description}"
        )
    except Exception as e:
        logger.error("Error in record_expense: %s", e, exc_info=True)
        return f"Failed to record expense: {str(e)}"


@merchant_agent.tool
async def get_current_expenses(ctx: RunContext[MerchantAgentDeps]) -> str:
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        stmt = select(Expense).where(Expense.merchant_id == _merchant_id(ctx))
        expenses = (await ctx.deps.db.execute(stmt)).scalars().all()
        if not expenses:
            return "No expenses recorded yet."

        lines = []
        total = Decimal("0.00")
        for e in expenses:
            lines.append(
                f"- EXPENSE_ID={e.id} | {e.category} | ₹{e.amount:.2f} | "
                f"due: {e.due_on} | notes: {e.notes or '-'}"
            )
            total += e.amount
        lines.append(f"\nTOTAL: ₹{total:.2f}")
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_current_expenses: %s", e, exc_info=True)
        return f"Error retrieving expenses: {str(e)}"


@merchant_agent.tool
async def update_expense(
    ctx: RunContext[MerchantAgentDeps],
    expense_id: str,
    amount: float | None = None,
    category: str | None = None,
    description: str | None = None,
) -> str:

    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        eid = uuid.UUID(str(expense_id))
        expense = await expense_repository.get_by_id(ctx.deps.db, eid, _merchant_id(ctx))
        if not expense:
            return f"Expense {expense_id} not found. Call get_current_expenses to list valid ids."

        before = {"amount": str(expense.amount), "category": expense.category, "notes": expense.notes}
        if amount is not None:
            expense.amount = Decimal(str(amount))
        if category is not None:
            expense.category = category.strip()
        if description is not None:
            expense.notes = description.strip()
        await ctx.deps.db.flush()

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="expense.updated",
            entity_type="expense",
            entity_id=str(expense.id),
            merchant_id=_merchant_id(ctx),
            user_id=_actor_user_id(ctx),
            details={"before": before, "after": {
                "amount": str(expense.amount), "category": expense.category, "notes": expense.notes,
            }},
        )
        await ctx.deps.db.commit()

        return (
            f"Expense updated.\n"
            f"EXPENSE_ID: {expense.id}\n"
            f"Category: {expense.category}\n"
            f"Amount: ₹{expense.amount:.2f}\n"
            f"Notes: {expense.notes or '-'}"
        )
    except Exception as e:
        logger.error("Error in update_expense: %s", e, exc_info=True)
        return f"Failed to update expense: {str(e)}"


@merchant_agent.tool
async def delete_expense(
    ctx: RunContext[MerchantAgentDeps],
    expense_id: str,
) -> str:
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        eid = uuid.UUID(str(expense_id))
        expense = await expense_repository.get_by_id(ctx.deps.db, eid, _merchant_id(ctx))
        if not expense:
            return f"Expense {expense_id} not found."

        snapshot = {"category": expense.category, "amount": str(expense.amount)}
        await expense_repository.delete_expense(ctx.deps.db, expense)

        await audit_log_repository.log_action(
            db=ctx.deps.db,
            action="expense.deleted",
            entity_type="expense",
            entity_id=str(eid),
            merchant_id=_merchant_id(ctx),
            user_id=_actor_user_id(ctx),
            details=snapshot,
        )
        await ctx.deps.db.commit()
        return f"Expense {expense_id} ({snapshot['category']} ₹{snapshot['amount']}) deleted."
    except Exception as e:
        logger.error("Error in delete_expense: %s", e, exc_info=True)
        return f"Failed to delete expense: {str(e)}"
