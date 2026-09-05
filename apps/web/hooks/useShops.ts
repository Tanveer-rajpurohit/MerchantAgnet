"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "../lib/api/services/shopService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useShopDirectoryStore } from "../stores/useShopDirectoryStore";
import type { ShopDetail, GetShopsParams } from "../types";

export function useShops(params?: GetShopsParams) {
  const shops = useShopDirectoryStore((s) => s.shops);
  const hasMore = useShopDirectoryStore((s) => s.hasMore);
  const nextCursor = useShopDirectoryStore((s) => s.nextCursor);
  const isStoreLoading = useShopDirectoryStore((s) => s.isLoading);
  const isLoadingMore = useShopDirectoryStore((s) => s.isLoadingMore);
  const searchQuery = useShopDirectoryStore((s) => s.searchQuery);
  const selectedCategory = useShopDirectoryStore((s) => s.selectedCategory);
  const setFilters = useShopDirectoryStore((s) => s.setFilters);
  const setInitialShops = useShopDirectoryStore((s) => s.setInitialShops);
  const appendMoreShops = useShopDirectoryStore((s) => s.appendMoreShops);
  const setLoadingMore = useShopDirectoryStore((s) => s.setLoadingMore);

  const search = params?.search || "";
  const category = params?.category || "All";

  useEffect(() => {
    if (search !== searchQuery || category !== selectedCategory) {
      setFilters(search, category);
    }
  }, [search, category, searchQuery, selectedCategory, setFilters]);

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
      setInitialShops(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data, setInitialShops]);

  const loadMoreShops = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await shopService.getShops({
        search: search.trim() || undefined,
        category: category === "All" ? undefined : category,
        cursor: nextCursor,
      });
      appendMoreShops(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      setLoadingMore(false);
    }
  }, [search, category, hasMore, nextCursor, isLoadingMore, setLoadingMore, appendMoreShops]);

  return {
    shops,
    hasMore,
    nextCursor,
    isLoading: query.isLoading || isStoreLoading,
    isLoadingMore,
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
    staleTime: 1000 * 10,
    refetchOnMount: "always",
  });
}
