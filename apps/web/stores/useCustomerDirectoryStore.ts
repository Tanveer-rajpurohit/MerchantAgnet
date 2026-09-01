import { create } from "zustand";
import type { CustomerConnectionResponse } from "../types/customer";

interface CustomerDirectoryState {
  customers: CustomerConnectionResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  searchQuery: string;
  statusFilter: string;
  setFilters: (search: string, status: string) => void;
  setInitialCustomers: (
    customers: CustomerConnectionResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  appendMoreCustomers: (
    customers: CustomerConnectionResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  updateCustomer: (updated: CustomerConnectionResponse) => void;
  setLoadingMore: (loading: boolean) => void;
  reset: () => void;
}

export const useCustomerDirectoryStore = create<CustomerDirectoryState>((set) => ({
  customers: [],
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
      customers: [],
      nextCursor: null,
      hasMore: false,
      isLoading: true,
    }),

  setInitialCustomers: (customers, nextCursor, hasMore) =>
    set({
      customers,
      nextCursor,
      hasMore,
      isLoading: false,
      isLoadingMore: false,
    }),

  appendMoreCustomers: (newCustomers, nextCursor, hasMore) =>
    set((state) => {
      const existingIds = new Set(state.customers.map((c) => c.id));
      const filtered = newCustomers.filter((c) => !existingIds.has(c.id));
      return {
        customers: [...state.customers, ...filtered],
        nextCursor,
        hasMore,
        isLoadingMore: false,
      };
    }),

  updateCustomer: (updated) =>
    set((state) => ({
      customers: state.customers.map((c) => (c.id === updated.id ? updated : c)),
    })),

  setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  reset: () =>
    set({
      customers: [],
      nextCursor: null,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      searchQuery: "",
      statusFilter: "all",
    }),
}));
