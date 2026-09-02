import { Trash2, Edit2, Calendar } from "lucide-react";
import type { ExpenseResponse } from "../../../../types";

interface ExpenseTableProps {
  expenses: ExpenseResponse[];
  onEdit: (expense: ExpenseResponse) => void;
  onDelete: (id: string) => void;
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  return (
    <div className="hidden sm:block rounded-xl border border-border bg-surface overflow-hidden">
      <table className="w-full text-sm font-intert">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-xs text-muted uppercase tracking-wide">
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Amount (₹)</th>
            <th className="px-5 py-3 font-medium">Due Date</th>
            <th className="px-5 py-3 font-medium">Notes</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((row) => {
            const formattedDate = row.due_on || "1st of month";

            return (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-surface-muted/60 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-primary">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
                    {row.category}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-primary">
                  ₹{Number(row.amount).toLocaleString("en-IN")}
                </td>
                <td className="px-5 py-3 text-secondary text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-muted" />
                    <span>{formattedDate}</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-muted text-xs max-w-xs truncate">
                  {row.notes || "No notes"}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-danger transition-colors cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-muted">
                No expenses logged yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
