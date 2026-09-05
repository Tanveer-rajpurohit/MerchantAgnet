"use client";

import { useEffect, useCallback } from "react";
import { useSocketStore } from "../stores/useSocketStore";
import type { UseRealtimeChatOptions } from "../types";

export function useRealtimeChat({
  connectionId,
  role,
  enabled = true,
}: UseRealtimeChatOptions) {
  const isConnected = useSocketStore((s) => s.isConnected);

  useEffect(() => {
    if (enabled && connectionId) {
      useSocketStore.getState().connect(connectionId, role);
    }

    return () => {
      if (connectionId) {
        useSocketStore.getState().disconnect();
      }
    };
  }, [connectionId, role, enabled]);

  const sendChatMessage = useCallback(
    (content: string) => {
      return useSocketStore.getState().sendMessage(content, role);
    },
    [role],
  );

  return {
    isConnected,
    sendChatMessage,
  };
}
