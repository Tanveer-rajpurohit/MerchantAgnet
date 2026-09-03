"use client";

import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { agentService } from "../lib/api/services/agentService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useAgentChatStore } from "../stores/useAgentChatStore";
import type { AgentPersona } from "../types";

export function useAgentStream() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    activeSessionId,
    isStreaming,
    streamingUserMessage,
    streamingAssistantResponse,
    error,
    startStreaming,
    appendStreamToken,
    finishStreaming,
    setStreamingError,
    resetStream,
  } = useAgentChatStore();

  const sendMessage = useCallback(
    async (message: string, persona: AgentPersona = "merchant_admin", customSessionId?: string | null) => {
      const trimmed = message.trim();
      if (!trimmed || isStreaming) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const targetSessionId = customSessionId || activeSessionId;
      startStreaming(trimmed, targetSessionId);

      try {
        await agentService.streamChat(
          {
            message: trimmed,
            session_id: targetSessionId,
            persona,
          },
          {
            onToken: (token) => {
              appendStreamToken(token);
            },
            onDone: (sessionId, runId) => {
              finishStreaming(sessionId, runId);
              queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions() });
              queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessionHistory(sessionId) });

              if (!activeSessionId || activeSessionId !== sessionId) {
                window.history.replaceState(null, "", `/chat/${sessionId}`);
              }
            },
            onError: (err) => {
              setStreamingError(err.message || "Failed to stream chat response");
            },
          },
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStreamingError((err as Error).message || "An unexpected error occurred");
        }
      }
    },
    [
      activeSessionId,
      isStreaming,
      startStreaming,
      appendStreamToken,
      finishStreaming,
      setStreamingError,
      queryClient,
      router,
    ]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    resetStream();
  }, [resetStream]);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
    streamingUserMessage,
    streamingAssistantResponse,
    error,
  };
}
