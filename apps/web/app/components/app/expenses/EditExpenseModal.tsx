"use client";

import { useState, useEffect } from "react";
import {
  EXPENSE_CATEGORIES,
  type ExpenseResponse,
  type ExpenseUpdatePayload,
} from "../../../../types/expense";
import { Select } from "../../../components/ui/Select";
import { DueDatePicker } from "./DueDatePicker";

interface EditExpenseModalProps {
  expense: ExpenseResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: ExpenseUpdatePayload) => Promise<void> | void;
  isPending?: boolean;
}

export function EditExpenseModal({
  expense,
  isOpen,
  onClose,
  onUpdate,
  isPending = false,
}: EditExpenseModalProps) {
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState<string>("1st of month");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (expense) {
      setCategory(expense.category);
      setAmount(String(expense.amount));
      setDueOn(expense.due_on || "1st of month");
      setNotes(expense.notes || "");
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    await onUpdate(expense.id, {
      category,
      amount: Number(amount) || 0,
      due_on: dueOn,
      notes: notes.trim() || null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 font-intert shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <h2 className="text-lg font-instrument text-primary mb-1">
          Edit Expense
        </h2>
        <p className="text-xs text-muted mb-4">
          Update operating cost or payment due dates.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Category *
            </label>
            <Select
              value={category}
              onChange={setCategory}
              options={[...EXPENSE_CATEGORIES]}
              placeholder="Select Category"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Amount (₹) *
            </label>
            <input
              required
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
            />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Due Date *
            </label>
            <DueDatePicker value={dueOn} onChange={setDueOn} />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1 font-medium">
              Notes / Description
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !amount}
              className="px-4 py-2 rounded-xl btn-brand-solid text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
