"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../lib/api/services/customerService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useCustomerDirectoryStore } from "../stores/useCustomerDirectoryStore";
import type {
  CustomerConnectionResponse,
  CustomerConnectionCreatePayload,
  ShopDetail,
  GetCustomerConnectionsParams,
} from "../types";

export function useCustomerConnections(params?: GetCustomerConnectionsParams) {
  const customers = useCustomerDirectoryStore((s) => s.customers);
  const hasMore = useCustomerDirectoryStore((s) => s.hasMore);
  const nextCursor = useCustomerDirectoryStore((s) => s.nextCursor);
  const isStoreLoading = useCustomerDirectoryStore((s) => s.isLoading);
  const isLoadingMore = useCustomerDirectoryStore((s) => s.isLoadingMore);
  const searchQuery = useCustomerDirectoryStore((s) => s.searchQuery);
  const statusFilter = useCustomerDirectoryStore((s) => s.statusFilter);
  const setFilters = useCustomerDirectoryStore((s) => s.setFilters);
  const setInitialCustomers = useCustomerDirectoryStore((s) => s.setInitialCustomers);
  const appendMoreCustomers = useCustomerDirectoryStore((s) => s.appendMoreCustomers);
  const setLoadingMore = useCustomerDirectoryStore((s) => s.setLoadingMore);

  const search = params?.search || "";
  const status = params?.status || "all";

  useEffect(() => {
    if (search !== searchQuery || status !== statusFilter) {
      setFilters(search, status);
    }
  }, [search, status, searchQuery, statusFilter, setFilters]);

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
      setInitialCustomers(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data, setInitialCustomers]);

  const loadMoreCustomers = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await customerService.getConnections({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        cursor: nextCursor,
      });
      appendMoreCustomers(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      setLoadingMore(false);
    }
  }, [search, status, hasMore, nextCursor, isLoadingMore, setLoadingMore, appendMoreCustomers]);

  return {
    customers,
    hasMore,
    nextCursor,
    isLoading: query.isLoading || isStoreLoading,
    isLoadingMore,
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
  const updateCustomer = useCustomerDirectoryStore((s) => s.updateCustomer);

  return useMutation<CustomerConnectionResponse, unknown, string>({
    mutationFn: (connectionId) => customerService.acceptConnection(connectionId),
    onSuccess: (updated) => {
      updateCustomer(updated);
      queryClient.setQueryData(queryKeys.customers.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
