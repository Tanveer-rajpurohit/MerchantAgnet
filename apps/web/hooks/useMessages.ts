"use client";

import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService } from "../lib/api/services/messageService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useMessageStore } from "../stores/useMessageStore";
import type { MessageResponse } from "../types";

export function useMessages(connectionId?: string | null) {
  const messages = useMessageStore((s) => s.messages);
  const storeConnectionId = useMessageStore((s) => s.connectionId);
  const hasMore = useMessageStore((s) => s.hasMore);
  const nextCursor = useMessageStore((s) => s.nextCursor);
  const isStoreLoading = useMessageStore((s) => s.isLoading);
  const isLoadingMore = useMessageStore((s) => s.isLoadingMore);
  const setConnectionId = useMessageStore((s) => s.setConnectionId);
  const setInitialMessages = useMessageStore((s) => s.setInitialMessages);
  const prependOlderMessages = useMessageStore((s) => s.prependOlderMessages);
  const appendMessage = useMessageStore((s) => s.appendMessage);
  const setLoadingMore = useMessageStore((s) => s.setLoadingMore);

  useEffect(() => {
    if (connectionId && connectionId !== storeConnectionId) {
      setConnectionId(connectionId);
    }
  }, [connectionId, storeConnectionId, setConnectionId]);

  const query = useQuery({
    queryKey: queryKeys.messages.list(connectionId || ""),
    queryFn: async () => {
      if (!connectionId) throw new Error("connectionId is required");
      return await messageService.getMessages(connectionId);
    },
    enabled: Boolean(connectionId),
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (query.data && connectionId) {
      setInitialMessages(
        query.data.items,
        query.data.next_cursor || null,
        query.data.has_more,
      );
    }
  }, [query.data, connectionId, setInitialMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!connectionId || !hasMore || !nextCursor || isLoadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const response = await messageService.getMessages(connectionId, {
        cursor: nextCursor,
      });
      prependOlderMessages(
        response.items,
        response.next_cursor || null,
        response.has_more,
      );
    } catch {
      setLoadingMore(false);
    }
  }, [connectionId, hasMore, nextCursor, isLoadingMore, setLoadingMore, prependOlderMessages]);

  const appendLiveMessage = useCallback(
    (message: MessageResponse) => {
      appendMessage(message);
    },
    [appendMessage],
  );

  return {
    messages,
    hasMore,
    nextCursor,
    isLoading: query.isLoading || isStoreLoading,
    isLoadingMore,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    loadOlderMessages,
    appendLiveMessage,
  };
}
