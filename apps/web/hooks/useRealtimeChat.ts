"use client";

import { useEffect, useCallback } from "react";
import { useSocketStore } from "../stores/useSocketStore";

interface UseRealtimeChatOptions {
  connectionId?: string | null;
  role: "customer" | "merchant";
  enabled?: boolean;
}

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
      useSocketStore.getState().disconnect();
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
