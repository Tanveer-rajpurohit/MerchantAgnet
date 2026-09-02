import { api } from "../utils/fetchClient";
import type { PaginatedShopResponse, ShopDetail } from "../../../types";

export interface GetShopsParams {
  search?: string;
  category?: string;
  cursor?: string;
  limit?: number;
}

export const shopService = {
  async getShops(params?: GetShopsParams): Promise<PaginatedShopResponse> {
    return await api.get<PaginatedShopResponse>("/shops", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getShopDetail(merchantId: string): Promise<ShopDetail> {
    return await api.get<ShopDetail>(`/shops/${merchantId}`);
  },
};
