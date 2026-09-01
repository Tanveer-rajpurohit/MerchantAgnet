"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService, type GetCustomerConnectionsParams } from "../lib/api/services/customerService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useCustomerDirectoryStore } from "../stores/useCustomerDirectoryStore";
import type {
  CustomerConnectionResponse,
  CustomerConnectionCreatePayload,
} from "../types/customer";
import type { ShopDetail } from "../types/shop";

export function useCustomerConnections(params?: GetCustomerConnectionsParams) {
  const store = useCustomerDirectoryStore();
  const search = params?.search || "";
  const status = params?.status || "all";

  useEffect(() => {
    if (search !== store.searchQuery || status !== store.statusFilter) {
      store.setFilters(search, status);
    }
  }, [search, status]);

  const query = useQuery({
    queryKey: queryKeys.customers.list({
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
    }),
    queryFn: async () => {
      return await customerService.getConnections({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
      });
    },
  });

  useEffect(() => {
    if (query.data) {
      store.setInitialCustomers(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data]);

  const loadMoreCustomers = useCallback(async () => {
    if (!store.hasMore || !store.nextCursor || store.isLoadingMore) {
      return;
    }
    store.setLoadingMore(true);
    try {
      const response = await customerService.getConnections({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        cursor: store.nextCursor,
      });
      store.appendMoreCustomers(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      store.setLoadingMore(false);
    }
  }, [search, status, store.hasMore, store.nextCursor, store.isLoadingMore]);

  return {
    customers: store.customers,
    hasMore: store.hasMore,
    nextCursor: store.nextCursor,
    isLoading: query.isLoading || store.isLoading,
    isLoadingMore: store.isLoadingMore,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadMoreCustomers,
  };
}

export function useCustomerConnectionDetail(connectionId?: string) {
  return useQuery<CustomerConnectionResponse>({
    queryKey: queryKeys.customers.detail(connectionId || ""),
    queryFn: () => customerService.getConnectionDetail(connectionId || ""),
    enabled: Boolean(connectionId),
  });
}

export function useCreateCustomerConnection() {
  const queryClient = useQueryClient();

  return useMutation<CustomerConnectionResponse, unknown, CustomerConnectionCreatePayload>({
    mutationFn: (payload) => customerService.createConnection(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<ShopDetail | undefined>(
        queryKeys.shops.detail(data.merchant_id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            customer_connection_id: data.id,
            conversation_id: data.conversation_id,
          };
        },
      );
    },
  });
}

export function useAcceptCustomerConnection() {
  const queryClient = useQueryClient();
  const store = useCustomerDirectoryStore();

  return useMutation<CustomerConnectionResponse, unknown, string>({
    mutationFn: (connectionId) => customerService.acceptConnection(connectionId),
    onSuccess: (updated) => {
      store.updateCustomer(updated);
      queryClient.setQueryData(queryKeys.customers.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
