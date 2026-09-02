export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Inventory / Stock",
  "Marketing",
  "Maintenance",
  "Software / SaaS",
  "Miscellaneous",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const DUE_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";
  return `${day}${suffix} of month`;
});

export interface ExpenseResponse {
  id: string;
  merchant_id: string;
  category: string;
  amount: number;
  due_on: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreatePayload {
  category: string;
  amount: number;
  due_on: string;
  notes?: string | null;
}

export interface ExpenseUpdatePayload {
  category?: string;
  amount?: number;
  due_on?: string;
  notes?: string | null;
}

export interface ExpenseBatchPayload {
  expenses: ExpenseCreatePayload[];
}
