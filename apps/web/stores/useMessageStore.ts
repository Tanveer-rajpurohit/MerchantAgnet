import { create } from "zustand";
import type { MessageResponse } from "../types";

export interface MessageState {
  connectionId: string | null;
  messages: MessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  setConnectionId: (connectionId: string | null) => void;
  setInitialMessages: (
    messages: MessageResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  prependOlderMessages: (
    olderMessages: MessageResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) => void;
  appendMessage: (message: MessageResponse) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  connectionId: null,
  messages: [],
  nextCursor: null,
  hasMore: false,
  isLoading: false,
  isLoadingMore: false,

  setConnectionId: (connectionId: string | null) =>
    set({
      connectionId,
      messages: [],
      nextCursor: null,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
    }),

  setInitialMessages: (
    messages: MessageResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) =>
    set({
      messages,
      nextCursor,
      hasMore,
      isLoading: false,
    }),

  prependOlderMessages: (
    olderMessages: MessageResponse[],
    nextCursor: string | null,
    hasMore: boolean,
  ) =>
    set((state) => ({
      messages: [...olderMessages, ...state.messages],
      nextCursor,
      hasMore,
      isLoadingMore: false,
    })),

  appendMessage: (message: MessageResponse) =>
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setLoadingMore: (loadingMore: boolean) => set({ isLoadingMore: loadingMore }),

  reset: () =>
    set({
      connectionId: null,
      messages: [],
      nextCursor: null,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
    }),
}));
