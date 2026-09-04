"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../lib/api/services/orderService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useOrderDirectoryStore } from "../stores/useOrderDirectoryStore";
import type {
  OrderCreatePayload,
  OrderUpdatePayload,
  OrderResponse,
  PaginatedOrderResponse,
  GetMerchantOrdersParams,
  GetCustomerOrdersParams,
} from "../types";

export function useOrders(params?: GetMerchantOrdersParams) {
  const orders = useOrderDirectoryStore((s) => s.orders);
  const hasMore = useOrderDirectoryStore((s) => s.hasMore);
  const nextCursor = useOrderDirectoryStore((s) => s.nextCursor);
  const isStoreLoading = useOrderDirectoryStore((s) => s.isLoading);
  const isLoadingMore = useOrderDirectoryStore((s) => s.isLoadingMore);
  const searchQuery = useOrderDirectoryStore((s) => s.searchQuery);
  const statusFilter = useOrderDirectoryStore((s) => s.statusFilter);
  const setFilters = useOrderDirectoryStore((s) => s.setFilters);
  const setInitialOrders = useOrderDirectoryStore((s) => s.setInitialOrders);
  const appendMoreOrders = useOrderDirectoryStore((s) => s.appendMoreOrders);
  const setLoadingMore = useOrderDirectoryStore((s) => s.setLoadingMore);

  const search = params?.search || "";
  const status = params?.status || "all";
  const customerId = params?.customer_id;

  useEffect(() => {
    if (search !== searchQuery || status !== statusFilter) {
      setFilters(search, status);
    }
  }, [search, status, searchQuery, statusFilter, setFilters]);

  const query = useQuery({
    queryKey: queryKeys.orders.list({
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      customer_id: customerId || undefined,
    }),
    queryFn: async () => {
      return await orderService.getMerchantOrders({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        customer_id: customerId,
      });
    },
  });

  useEffect(() => {
    if (query.data) {
      setInitialOrders(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data, setInitialOrders]);

  const loadMoreOrders = useCallback(async () => {
    if (!hasMore || !nextCursor || isLoadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await orderService.getMerchantOrders({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        customer_id: customerId,
        cursor: nextCursor,
      });
      appendMoreOrders(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      setLoadingMore(false);
    }
  }, [search, status, customerId, hasMore, nextCursor, isLoadingMore, setLoadingMore, appendMoreOrders]);

  return {
    orders,
    hasMore,
    nextCursor,
    isLoading: query.isLoading || isStoreLoading,
    isLoadingMore,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadMoreOrders,
  };
}

export function useCustomerOrders(params?: GetCustomerOrdersParams) {
  return useQuery<PaginatedOrderResponse>({
    queryKey: queryKeys.orders.myOrders((params || {}) as Record<string, unknown>),
    queryFn: () => orderService.getCustomerOrders(params),
  });
}

export function useOrderDetail(orderId?: string) {
  return useQuery<OrderResponse>({
    queryKey: queryKeys.orders.detail(orderId || ""),
    queryFn: () => orderService.getOrderDetail(orderId || ""),
    enabled: Boolean(orderId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const prependOrder = useOrderDirectoryStore((s) => s.prependOrder);

  return useMutation<OrderResponse, unknown, OrderCreatePayload>({
    mutationFn: (payload) => orderService.createOrder(payload),
    onSuccess: (newOrder) => {
      prependOrder(newOrder);
      queryClient.setQueryData(queryKeys.orders.detail(newOrder.id), newOrder);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const updateOrderStore = useOrderDirectoryStore((s) => s.updateOrder);

  return useMutation<OrderResponse, unknown, { orderId: string; payload: OrderUpdatePayload }>({
    mutationFn: ({ orderId, payload }) => orderService.updateOrder(orderId, payload),
    onSuccess: (updatedOrder) => {
      updateOrderStore(updatedOrder);
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
