import { api } from "../utils/fetchClient";
import type { PaginatedShopResponse, ShopDetail, GetShopsParams } from "../../../types";

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
