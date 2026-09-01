import { api } from "../utils/fetchClient";
import type {
  ExpenseResponse,
  ExpenseCreatePayload,
  ExpenseUpdatePayload,
  ExpenseBatchPayload,
} from "../../../types/expense";

export const expenseService = {
  async getExpenses(): Promise<ExpenseResponse[]> {
    return await api.get<ExpenseResponse[]>("/expenses");
  },

  async getExpense(expenseId: string): Promise<ExpenseResponse> {
    return await api.get<ExpenseResponse>(`/expenses/${expenseId}`);
  },

  async createExpense(payload: ExpenseCreatePayload): Promise<ExpenseResponse> {
    return await api.post<ExpenseResponse>("/expenses", payload);
  },

  async updateExpense(
    expenseId: string,
    payload: ExpenseUpdatePayload,
  ): Promise<ExpenseResponse> {
    return await api.put<ExpenseResponse>(`/expenses/${expenseId}`, payload);
  },

  async deleteExpense(expenseId: string): Promise<void> {
    await api.delete<void>(`/expenses/${expenseId}`);
  },

  async batchReplaceExpenses(
    payload: ExpenseBatchPayload,
  ): Promise<ExpenseResponse[]> {
    return await api.put<ExpenseResponse[]>("/expenses/batch", payload);
  },
};
