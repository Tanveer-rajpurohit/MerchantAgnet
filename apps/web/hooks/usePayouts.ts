"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutService } from "../lib/api/services/payoutService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  PayoutsSummaryResponse,
  SettlementListResponse,
  SettlementListParams,
} from "../types";

export function usePayoutsSummary() {
  return useQuery<PayoutsSummaryResponse>({
    queryKey: queryKeys.payouts.summary,
    queryFn: () => payoutService.getPayoutsSummary(),
    enabled: tokenStorage.hasTokens(),
  });
}

export function useSettlements(params?: SettlementListParams) {
  return useQuery<SettlementListResponse>({
    queryKey: queryKeys.payouts.settlements(params as Record<string, unknown>),
    queryFn: () => payoutService.listSettlements(params),
    placeholderData: (prev) => prev,
    enabled: tokenStorage.hasTokens(),
  });
}

export function useSyncSettlements() {
  const queryClient = useQueryClient();

  return useMutation<{ status: string; synced_count: number }, Error, number | undefined>({
    mutationFn: (count?: number) => payoutService.syncSettlements(count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });
    },
  });
}
