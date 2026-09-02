import { api } from "../utils/fetchClient";
import type {
  PayoutsSummaryResponse,
  SettlementListResponse,
  SettlementListParams,
} from "../../../types";

export const payoutService = {
  async getPayoutsSummary(): Promise<PayoutsSummaryResponse> {
    return await api.get<PayoutsSummaryResponse>("/payouts/summary");
  },

  async listSettlements(params?: SettlementListParams): Promise<SettlementListResponse> {
    return await api.get<SettlementListResponse>("/payouts/settlements", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async syncSettlements(count: number = 30): Promise<{ status: string; synced_count: number }> {
    return await api.post<{ status: string; synced_count: number }>(`/payouts/settlements/sync?count=${count}`);
  },
};
