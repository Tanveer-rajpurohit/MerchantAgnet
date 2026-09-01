import { create } from "zustand";
import type { ShopListItem } from "../types/shop";

export interface ShopDirectoryState {
  searchQuery: string;
  selectedCategory: string;
  shops: ShopListItem[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  setFilters: (searchQuery: string, selectedCategory: string) => void;
  setInitialShops: (
    shops: ShopListItem[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  appendMoreShops: (
    moreShops: ShopListItem[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  reset: () => void;
}

export const useShopDirectoryStore = create<ShopDirectoryState>((set) => ({
  searchQuery: "",
  selectedCategory: "All",
  shops: [],
  nextCursor: null,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,

  setFilters: (searchQuery: string, selectedCategory: string) =>
    set({
      searchQuery,
      selectedCategory,
      shops: [],
      nextCursor: null,
      hasMore: false,
      isLoading: true,
      isLoadingMore: false,
    }),

  setInitialShops: (
    shops: ShopListItem[],
    nextCursor: string | null,
    hasMore: boolean,
  ) =>
    set({
      shops,
      nextCursor,
      hasMore,
      isLoading: false,
    }),

  appendMoreShops: (
    moreShops: ShopListItem[],
    nextCursor: string | null,
    hasMore: boolean,
  ) =>
    set((state) => {
      const existingIds = new Set(state.shops.map((s) => s.id));
      const freshNew = moreShops.filter((s) => !existingIds.has(s.id));
      return {
        shops: [...state.shops, ...freshNew],
        nextCursor,
        hasMore,
        isLoadingMore: false,
      };
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setLoadingMore: (loadingMore: boolean) => set({ isLoadingMore: loadingMore }),

  reset: () =>
    set({
      searchQuery: "",
      selectedCategory: "All",
      shops: [],
      nextCursor: null,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
    }),
}));
