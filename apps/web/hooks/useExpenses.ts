"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "../lib/api/services/expenseService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  ExpenseResponse,
  ExpenseCreatePayload,
  ExpenseUpdatePayload,
} from "../types";

export function useExpenses() {
  return useQuery<ExpenseResponse[]>({
    queryKey: queryKeys.expenses.all,
    queryFn: () => expenseService.getExpenses(),
  });
}

export function useExpense(expenseId?: string) {
  return useQuery<ExpenseResponse>({
    queryKey: queryKeys.expenses.detail(expenseId || ""),
    queryFn: () => expenseService.getExpense(expenseId || ""),
    enabled: Boolean(expenseId),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation<ExpenseResponse, unknown, ExpenseCreatePayload>({
    mutationFn: (payload) => expenseService.createExpense(payload),
    onSuccess: (newExpense) => {
      queryClient.setQueryData<ExpenseResponse[] | undefined>(
        queryKeys.expenses.all,
        (old) => [newExpense, ...(old || [])],
      );
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation<
    ExpenseResponse,
    unknown,
    { id: string; payload: ExpenseUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => expenseService.updateExpense(id, payload),
    onSuccess: (updatedExpense) => {
      queryClient.setQueryData<ExpenseResponse[] | undefined>(
        queryKeys.expenses.all,
        (old) => old?.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)),
      );
      queryClient.setQueryData(
        queryKeys.expenses.detail(updatedExpense.id),
        updatedExpense,
      );
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (expenseId) => expenseService.deleteExpense(expenseId),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ExpenseResponse[] | undefined>(
        queryKeys.expenses.all,
        (old) => old?.filter((e) => e.id !== deletedId),
      );
    },
  });
}
