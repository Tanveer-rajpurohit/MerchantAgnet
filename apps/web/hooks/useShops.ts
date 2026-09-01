"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService, type GetShopsParams } from "../lib/api/services/shopService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useShopDirectoryStore } from "../stores/useShopDirectoryStore";
import type { ShopDetail } from "../types/shop";

export function useShops(params?: GetShopsParams) {
  const store = useShopDirectoryStore();
  const search = params?.search || "";
  const category = params?.category || "All";

  useEffect(() => {
    if (search !== store.searchQuery || category !== store.selectedCategory) {
      store.setFilters(search, category);
    }
  }, [search, category]);

  const query = useQuery({
    queryKey: queryKeys.shops.list({
      search: search.trim() || undefined,
      category: category === "All" ? undefined : category,
    }),
    queryFn: async () => {
      return await shopService.getShops({
        search: search.trim() || undefined,
        category: category === "All" ? undefined : category,
      });
    },
  });

  useEffect(() => {
    if (query.data) {
      store.setInitialShops(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data]);

  const loadMoreShops = useCallback(async () => {
    if (!store.hasMore || !store.nextCursor || store.isLoadingMore) {
      return;
    }
    store.setLoadingMore(true);
    try {
      const response = await shopService.getShops({
        search: search.trim() || undefined,
        category: category === "All" ? undefined : category,
        cursor: store.nextCursor,
      });
      store.appendMoreShops(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      store.setLoadingMore(false);
    }
  }, [search, category, store.hasMore, store.nextCursor, store.isLoadingMore]);

  return {
    shops: store.shops,
    hasMore: store.hasMore,
    nextCursor: store.nextCursor,
    isLoading: query.isLoading || store.isLoading,
    isLoadingMore: store.isLoadingMore,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadMoreShops,
  };
}

export function useShopDetail(merchantId?: string) {
  return useQuery<ShopDetail>({
    queryKey: queryKeys.shops.detail(merchantId || ""),
    queryFn: () => shopService.getShopDetail(merchantId || ""),
    enabled: Boolean(merchantId),
  });
}
