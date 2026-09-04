"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api/utils/fetchClient";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type { CampaignApproveResult, CampaignDeclineResult } from "../types";

export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      return await api.post<CampaignApproveResult>(`/campaigns/${campaignId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useDeclineCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      return await api.post<CampaignDeclineResult>(`/campaigns/${campaignId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
    },
  });
}
