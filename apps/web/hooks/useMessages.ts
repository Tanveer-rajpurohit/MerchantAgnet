"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService } from "../lib/api/services/messageService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useMessageStore } from "../stores/useMessageStore";
import type { MessageResponse } from "../types/message";

export function useMessages(connectionId?: string | null) {
  const store = useMessageStore();

  useEffect(() => {
    if (connectionId && connectionId !== store.connectionId) {
      store.setConnectionId(connectionId);
    }
  }, [connectionId, store.connectionId]);

  const query = useQuery({
    queryKey: queryKeys.messages.list(connectionId || ""),
    queryFn: async () => {
      if (!connectionId) throw new Error("connectionId is required");
      return await messageService.getMessages(connectionId);
    },
    enabled: Boolean(connectionId),
  });

  useEffect(() => {
    if (query.data && connectionId) {
      store.setInitialMessages(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data, connectionId]);

  const loadOlderMessages = useCallback(async () => {
    if (!connectionId || !store.hasMore || !store.nextCursor || store.isLoadingMore) {
      return;
    }
    store.setLoadingMore(true);
    try {
      const response = await messageService.getMessages(connectionId, {
        cursor: store.nextCursor,
      });
      store.prependOlderMessages(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      store.setLoadingMore(false);
    }
  }, [connectionId, store.hasMore, store.nextCursor, store.isLoadingMore]);

  const appendLiveMessage = useCallback(
    (message: MessageResponse) => {
      store.appendMessage(message);
    },
    [],
  );

  return {
    messages: store.messages,
    hasMore: store.hasMore,
    nextCursor: store.nextCursor,
    isLoading: query.isLoading || store.isLoading,
    isLoadingMore: store.isLoadingMore,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadOlderMessages,
    appendLiveMessage,
  };
}
