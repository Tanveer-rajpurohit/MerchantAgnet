import logging
import uuid
from decimal import Decimal

from sqlalchemy import select
from pydantic_ai import RunContext

from app.agents.deps import MerchantAgentDeps
from app.agents.base_agent import merchant_agent
from app.models.expense import Expense
from app.repositories import audit_log_repository, expense_repository
from app.agents.tools.common import _merchant_id, _actor_user_id, _guard_merchant, lock_db

logger = logging.getLogger(__name__)


@merchant_agent.tool
async def record_expense(
    ctx: RunContext[MerchantAgentDeps],
    amount: float,
    category: str = "misc",
    description: str = "",
    name: str | None = None,
) -> str:
    """Record a business expense for the merchant's store.

    Call this when the merchant mentions an operating cost, supplier bill, utility, rent, or maintenance expense.
    - amount: Expense amount in INR (e.g. 1200.0).
    - category: Category of expense (e.g. 'inventory', 'utilities', 'rent', 'logistics', 'salaries', 'misc').
    - description: Description or note for the expense.
    - name: Optional name or title for the expense (e.g. 'Shop Rent').
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            cat = category.strip()
            notes = description.strip()
            if name:
                if cat == "misc":
                    cat = name.strip()
                if not notes:
                    notes = name.strip()

            expense = Expense(
                merchant_id=_merchant_id(ctx),
                amount=Decimal(str(amount)),
                category=cat,
                notes=notes,
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
            f"Category: {expense.category}\n"
            f"Amount: ₹{expense.amount:.2f}\n"
            f"Description: {expense.notes or '-'}"
        )
    except Exception as e:
        logger.error("Error in record_expense: %s", e, exc_info=True)
        return f"Failed to record expense: {str(e)}"


@merchant_agent.tool
async def get_current_expenses(ctx: RunContext[MerchantAgentDeps]) -> str:
    """Retrieve all recorded store expenses, bills, and the total expense spend.

    MANDATORY USAGE RULE:
    Call this tool ONLY when the merchant EXPLICITLY asks about store expenses, operational costs, or bills:
    - "What are my expenses?", "Store expenses list", "Show my shop bills", "Total kharcha kitna hai", "List expenses"

    STRICT PROHIBITION:
    - NEVER call this tool when the merchant asks about "profit", "earnings", "collection", "sales", "revenue", "today's profit", "yesterday's profit", "weekly profit", or "monthly profit"!
    - In this retail store system, daily/weekly/monthly profit questions are answered strictly via collections tools (`get_daily_collection`, `get_store_revenue_report`). Never attempt to calculate profit by calling this expense tool.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            stmt = select(Expense).where(Expense.merchant_id == _merchant_id(ctx))
            expenses = (await ctx.deps.db.execute(stmt)).scalars().all()
            if not expenses:
                return "No expenses recorded yet."

            lines = [
                "| Expense Category | Amount | Due Date | Description / Notes | ID |",
                "| :--- | :--- | :--- | :--- | :--- |",
            ]
            total = Decimal("0.00")
            for e in expenses:
                lines.append(
                    f"| {e.category} | ₹{e.amount:.2f} | {e.due_on or '-'} | {e.notes or '-'} | {e.id} |"
                )
                total += e.amount
            lines.append(f"\n**Total Recurring Overhead:** ₹{total:.2f}")
            return "\n".join(lines)
    except Exception as e:
        logger.error("Error in get_current_expenses: %s", e, exc_info=True)
        return f"Error retrieving expenses: {str(e)}"


@merchant_agent.tool
async def update_expense(
    ctx: RunContext[MerchantAgentDeps],
    expense_name_or_category: str | None = None,
    expense_id: str | None = None,
    amount: float | None = None,
    category: str | None = None,
    description: str | None = None,
    notes: str | None = None,
) -> str:
    """Update or change an existing expense record (e.g. Shop Rent, Electricity, Staff Salary, etc.).

    NEVER ask the merchant for a UUID!
    Pass `expense_name_or_category` (e.g. "Shop Rent", "Rent", "Electricity") OR `expense_id`.
    - expense_name_or_category: Name, category, or note of the expense to update (e.g. 'Shop Rent', 'Rent').
    - expense_id: UUID or identifier of the expense if known.
    - amount: New expense amount in INR (e.g. 23000.0).
    - category: New category name if changing category.
    - description: New description or notes.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            merchant_id = _merchant_id(ctx)
            expense = None

            identifier = expense_name_or_category or expense_id
            if not identifier and category:
                identifier = category
            if not identifier and description:
                identifier = description

            if identifier:
                try:
                    eid = uuid.UUID(str(identifier).strip())
                    expense = await expense_repository.get_by_id(ctx.deps.db, eid, merchant_id)
                except (ValueError, AttributeError):
                    pass

            if not expense and identifier:
                clean_term = str(identifier).strip()
                stmt = (
                    select(Expense)
                    .where(
                        Expense.merchant_id == merchant_id,
                        (
                            Expense.category.ilike(clean_term)
                            | Expense.notes.ilike(clean_term)
                        ),
                    )
                    .order_by(Expense.created_at.desc())
                    .limit(1)
                )
                expense = (await ctx.deps.db.execute(stmt)).scalars().first()

                if not expense:
                    stmt = (
                        select(Expense)
                        .where(
                            Expense.merchant_id == merchant_id,
                            (
                                Expense.category.ilike(f"%{clean_term}%")
                                | Expense.notes.ilike(f"%{clean_term}%")
                            ),
                        )
                        .order_by(Expense.created_at.desc())
                        .limit(1)
                    )
                    expense = (await ctx.deps.db.execute(stmt)).scalars().first()

            if not expense:
                if amount is not None:
                    cat_name = category or identifier or "misc"
                    desc_name = description or notes or identifier or ""
                    expense = Expense(
                        merchant_id=merchant_id,
                        amount=Decimal(str(amount)),
                        category=cat_name.strip(),
                        notes=desc_name.strip(),
                    )
                    ctx.deps.db.add(expense)
                    await ctx.deps.db.flush()
                    await audit_log_repository.log_action(
                        db=ctx.deps.db,
                        action="expense.created",
                        entity_type="expense",
                        entity_id=str(expense.id),
                        merchant_id=merchant_id,
                        user_id=_actor_user_id(ctx),
                        details={"amount": str(expense.amount), "category": expense.category},
                    )
                    await ctx.deps.db.commit()
                    return (
                        f"Expense recorded.\n"
                        f"EXPENSE_ID: {expense.id}\n"
                        f"Category: {expense.category}\n"
                        f"Amount: ₹{expense.amount:.2f}\n"
                        f"Description: {expense.notes or '-'}"
                    )
                return f"Could not find an expense matching '{identifier or 'unspecified'}'. Call get_current_expenses to see current expenses."

            before = {"amount": str(expense.amount), "category": expense.category, "notes": expense.notes}
            if amount is not None:
                expense.amount = Decimal(str(amount))
            if category is not None:
                expense.category = category.strip()
            effective_notes = description if description is not None else notes
            if effective_notes is not None:
                expense.notes = effective_notes.strip()

            await ctx.deps.db.flush()

            await audit_log_repository.log_action(
                db=ctx.deps.db,
                action="expense.updated",
                entity_type="expense",
                entity_id=str(expense.id),
                merchant_id=merchant_id,
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
    expense_name_or_category: str | None = None,
    expense_id: str | None = None,
) -> str:
    """Delete an expense record by its name, category, or UUID.

    Call this when the merchant wants to remove or cancel a recorded expense.
    NEVER ask the merchant for a UUID.
    - expense_name_or_category: Name or category of the expense (e.g. 'Shop Rent', 'rent').
    - expense_id: UUID of the expense if known.
    """
    guard = _guard_merchant(ctx)
    if guard:
        return guard

    try:
        async with lock_db(ctx):
            merchant_id = _merchant_id(ctx)
            expense = None

            identifier = expense_name_or_category or expense_id
            if identifier:
                try:
                    eid = uuid.UUID(str(identifier).strip())
                    expense = await expense_repository.get_by_id(ctx.deps.db, eid, merchant_id)
                except (ValueError, AttributeError):
                    pass

            if not expense and identifier:
                clean_term = str(identifier).strip()
                stmt = (
                    select(Expense)
                    .where(
                        Expense.merchant_id == merchant_id,
                        (
                            Expense.category.ilike(f"%{clean_term}%")
                            | Expense.notes.ilike(f"%{clean_term}%")
                        ),
                    )
                    .order_by(Expense.created_at.desc())
                    .limit(1)
                )
                expense = (await ctx.deps.db.execute(stmt)).scalars().first()

            if not expense:
                return f"Expense '{identifier or 'unspecified'}' not found."

            snapshot = {"category": expense.category, "amount": str(expense.amount)}
            await expense_repository.delete_expense(ctx.deps.db, expense)

            await audit_log_repository.log_action(
                db=ctx.deps.db,
                action="expense.deleted",
                entity_type="expense",
                entity_id=str(expense.id),
                merchant_id=merchant_id,
                user_id=_actor_user_id(ctx),
                details=snapshot,
            )
            await ctx.deps.db.commit()
            return f"Expense '{snapshot['category']}' (₹{snapshot['amount']}) deleted."
    except Exception as e:
        logger.error("Error in delete_expense: %s", e, exc_info=True)
        return f"Failed to delete expense: {str(e)}"
