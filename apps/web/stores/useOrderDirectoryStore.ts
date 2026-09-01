import { create } from "zustand";
import type { OrderResponse } from "../types/order";

interface OrderDirectoryState {
  orders: OrderResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  searchQuery: string;
  statusFilter: string;
  setFilters: (search: string, status: string) => void;
  setInitialOrders: (
    orders: OrderResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  appendMoreOrders: (
    orders: OrderResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  prependOrder: (order: OrderResponse) => void;
  updateOrder: (updated: OrderResponse) => void;
  setLoadingMore: (loading: boolean) => void;
  reset: () => void;
}

export const useOrderDirectoryStore = create<OrderDirectoryState>((set) => ({
  orders: [],
  nextCursor: null,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,
  searchQuery: "",
  statusFilter: "all",

  setFilters: (searchQuery, statusFilter) =>
    set({
      searchQuery,
      statusFilter,
      orders: [],
      nextCursor: null,
      hasMore: false,
      isLoading: true,
    }),

  setInitialOrders: (orders, nextCursor, hasMore) =>
    set({
      orders,
      nextCursor,
      hasMore,
      isLoading: false,
      isLoadingMore: false,
    }),

  appendMoreOrders: (newOrders, nextCursor, hasMore) =>
    set((state) => {
      const existingIds = new Set(state.orders.map((o) => o.id));
      const filtered = newOrders.filter((o) => !existingIds.has(o.id));
      return {
        orders: [...state.orders, ...filtered],
        nextCursor,
        hasMore,
        isLoadingMore: false,
      };
    }),

  prependOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
    })),

  updateOrder: (updated) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === updated.id ? updated : o)),
    })),

  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  reset: () =>
    set({
      orders: [],
      nextCursor: null,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      searchQuery: "",
      statusFilter: "all",
    }),
}));
