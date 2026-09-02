import { Trash2, Edit2, Calendar } from "lucide-react";
import type { ExpenseResponse } from "../../../../types";

interface ExpenseMobileListProps {
  expenses: ExpenseResponse[];
  onEdit: (expense: ExpenseResponse) => void;
  onDelete: (id: string) => void;
}

export function ExpenseMobileList({
  expenses,
  onEdit,
  onDelete,
}: ExpenseMobileListProps) {
  return (
    <div className="sm:hidden flex flex-col gap-2.5">
      {expenses.map((row) => {
        const formattedDate = row.due_on || "1st of month";

        return (
          <div
            key={row.id}
            className="rounded-xl border border-border bg-surface p-4 font-intert"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-medium mb-1">
                  {row.category}
                </span>
                <p className="text-base font-semibold text-primary">
                  ₹{Number(row.amount).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(row)}
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="p-1.5 rounded-lg text-muted hover:text-danger transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs text-muted pt-2 border-t border-border mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-muted" />
                <span>Due {formattedDate}</span>
              </span>
              {row.notes && (
                <p className="text-secondary truncate">{row.notes}</p>
              )}
            </div>
          </div>
        );
      })}
      {expenses.length === 0 && (
        <div className="py-10 text-center text-muted text-sm border border-border rounded-xl bg-surface">
          No expenses logged yet.
        </div>
      )}
    </div>
  );
}
