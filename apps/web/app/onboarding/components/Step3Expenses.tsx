"use client";

import { Plus, Trash2 } from "lucide-react";
import { ExpenseRow } from "../../types/onboarding";

const generateId = () => Math.random().toString(36).slice(2, 9);

export function Step3Expenses({
  expenses,
  setExpenses,
}: {
  expenses: ExpenseRow[];
  setExpenses: (e: ExpenseRow[]) => void;
}) {
  const addRow = () => {
    setExpenses([
      ...expenses,
      { id: generateId(), category: "", amount: "", dueDate: "", notes: "" },
    ]);
  };

  const removeRow = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const updateRow = (id: string, field: keyof ExpenseRow, value: string) => {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const totalCosts = expenses.reduce((sum, e) => {
    const amount = parseFloat(e.amount.replace(/,/g, "")) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument text-3xl text-primary mb-2">
          Fixed Monthly Expenses
        </h2>
        <p className="font-intert text-secondary text-sm">
          Your AI agent uses this to track budgets and forecast cash flow.
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-intert">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                  Amount (₹)
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">
                  Notes
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="Shop Rent"
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row.id, "category", e.target.value)
                      }
                      className="w-full bg-transparent text-primary placeholder:text-muted focus:outline-none py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="15,000"
                      value={row.amount}
                      onChange={(e) =>
                        updateRow(row.id, "amount", e.target.value)
                      }
                      className="w-full bg-transparent text-primary font-mono placeholder:text-muted focus:outline-none py-1"
                    />
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    <input
                      type="text"
                      placeholder="5th of month"
                      value={row.dueDate}
                      onChange={(e) =>
                        updateRow(row.id, "dueDate", e.target.value)
                      }
                      className="w-full bg-transparent text-primary placeholder:text-muted focus:outline-none py-1"
                    />
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    <input
                      type="text"
                      placeholder="Optional"
                      value={row.notes}
                      onChange={(e) =>
                        updateRow(row.id, "notes", e.target.value)
                      }
                      className="w-full bg-transparent text-muted placeholder:text-muted focus:outline-none py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-muted hover:text-danger transition-colors p-1"
                      aria-label="Delete row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-surface-muted border-t border-border">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 text-xs font-medium font-intert text-brand hover:text-brand-subtle transition-colors"
          >
            <Plus size={14} /> Add row
          </button>
          <div className="text-xs font-intert text-primary font-medium">
            Total:{" "}
            <span className="font-mono">
              ₹{totalCosts.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
