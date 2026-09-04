"use client";

import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { agentService } from "../lib/api/services/agentService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import { useAgentChatStore } from "../stores/useAgentChatStore";
import type { AgentPersona, ChatSessionHistoryResponse } from "../types";

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
    async (
      message: string,
      persona: AgentPersona = "merchant_admin",
      customSessionId?: string | null,
      attachedCustomer?:
        | {
            id?: string;
            customer_id?: string;
            customer_name?: string;
            customer_phone?: string | null;
          }
        | Array<{
            id?: string;
            customer_id?: string;
            customer_name?: string;
            customer_phone?: string | null;
          }>
        | null,
    ) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      if (isStreaming) {
        abortControllerRef.current?.abort();
        resetStream();
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const targetSessionId = customSessionId || activeSessionId;
      startStreaming(trimmed, targetSessionId);

      const custList = Array.isArray(attachedCustomer)
        ? attachedCustomer
        : attachedCustomer
        ? [attachedCustomer]
        : [];
      const primaryCust = custList[0] || null;
      const targetCustomersPayload = custList.map((c) => ({
        customer_id: c.customer_id || null,
        customer_connection_id: c.id || null,
        customer_name: c.customer_name || null,
        customer_phone: c.customer_phone || null,
      }));

      let streamedResponseAccumulator = "";

      try {
        await agentService.streamChat(
          {
            message: trimmed,
            session_id: targetSessionId,
            persona,
            target_customer_id: primaryCust?.customer_id || null,
            target_customer_connection_id: primaryCust?.id || null,
            target_customer_name: primaryCust?.customer_name || null,
            target_customer_phone: primaryCust?.customer_phone || null,
            target_customers: targetCustomersPayload.length > 0 ? targetCustomersPayload : null,
          },
          {
            onToken: (token) => {
              streamedResponseAccumulator += token;
              appendStreamToken(token);
            },
            onDone: (sessionId, runId, toolsInvoked) => {
              const runRecord = {
                id: runId || `run-${Date.now()}`,
                session_id: sessionId,
                merchant_id: "",
                persona,
                user_message: trimmed,
                agent_response: streamedResponseAccumulator,
                tools_invoked: toolsInvoked || [],
                status: "success" as const,
                latency_ms: null,
                created_at: new Date().toISOString(),
              };

              queryClient.setQueryData<ChatSessionHistoryResponse>(
                queryKeys.agent.sessionHistory(sessionId),
                (old) => {
                  const runs = old?.runs ? [...old.runs] : [];
                  if (!runs.some((r) => r.id === runRecord.id)) {
                    runs.push(runRecord);
                  }
                  return {
                    session_id: sessionId,
                    runs,
                    total_turns: runs.length,
                  };
                }
              );

              finishStreaming(sessionId, runId, toolsInvoked);
              queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions() });
              queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessionHistory(sessionId) });

              if (typeof window !== "undefined" && window.location.pathname !== `/chat/${sessionId}`) {
                router.push(`/chat/${sessionId}`);
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
        } else {
          resetStream();
        }
      } finally {
        if (useAgentChatStore.getState().isStreaming) {
          finishStreaming(targetSessionId || "", "");
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
      resetStream,
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
