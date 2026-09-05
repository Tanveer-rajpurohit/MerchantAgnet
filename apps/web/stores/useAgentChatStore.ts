import { create } from "zustand";
import type { AgentRunRecord, AgentChatState } from "../types";

export const useAgentChatStore = create<AgentChatState>((set) => ({
  activeSessionId: null,
  activeSessionTitle: null,
  runs: [],
  isStreaming: false,
  streamingUserMessage: null,
  streamingAssistantResponse: "",
  streamingRunId: null,
  error: null,

  setActiveSession: (sessionId, title = null) =>
    set({
      activeSessionId: sessionId,
      activeSessionTitle: title,
      runs: [],
      isStreaming: false,
      streamingUserMessage: null,
      streamingAssistantResponse: "",
      error: null,
    }),

  setRuns: (runs) => set({ runs }),

  appendRun: (run) =>
    set((state) => {
      const exists = state.runs.some((r) => r.id === run.id);
      if (exists) return state;
      return { runs: [...state.runs, run] };
    }),

  startStreaming: (userMessage, sessionId = null) =>
    set((state) => ({
      activeSessionId: sessionId || state.activeSessionId,
      isStreaming: true,
      streamingUserMessage: userMessage,
      streamingAssistantResponse: "",
      error: null,
    })),

  appendStreamToken: (token) =>
    set((state) => ({
      streamingAssistantResponse: state.streamingAssistantResponse + token,
    })),

  finishStreaming: (sessionId, runId, toolsInvoked) =>
    set((state) => {
      if (!state.streamingUserMessage) {
        return {
          isStreaming: false,
          streamingUserMessage: null,
          streamingAssistantResponse: "",
          activeSessionId: sessionId,
        };
      }

      const completedRun: AgentRunRecord = {
        id: runId || Math.random().toString(36).slice(2, 9),
        session_id: sessionId,
        merchant_id: "",
        persona: "merchant_admin",
        user_message: state.streamingUserMessage,
        agent_response: state.streamingAssistantResponse,
        tools_invoked: toolsInvoked || [],
        status: "success",
        latency_ms: null,
        created_at: new Date().toISOString(),
      };

      return {
        activeSessionId: sessionId,
        isStreaming: false,
        streamingUserMessage: null,
        streamingAssistantResponse: "",
        runs: [...state.runs, completedRun],
      };
    }),

  setStreamingError: (error) =>
    set((state) => {
      const userMsg = state.streamingUserMessage;
      if (!userMsg) {
        return {
          isStreaming: false,
          error,
        };
      }

      const errorMsg = error.toLowerCase().includes("session expired")
        ? "Your session has expired. Please sign in again to continue."
        : `Unable to complete request: ${error}. Please try again.`;

      const failedRun: AgentRunRecord = {
        id: `failed-${Date.now()}`,
        session_id: state.activeSessionId,
        merchant_id: "",
        persona: "merchant_admin",
        user_message: userMsg,
        agent_response: errorMsg,
        tools_invoked: [],
        status: "failed",
        latency_ms: null,
        created_at: new Date().toISOString(),
      };

      return {
        isStreaming: false,
        streamingUserMessage: null,
        streamingAssistantResponse: "",
        error,
        runs: [...state.runs, failedRun],
      };
    }),

  resetStream: () =>
    set({
      isStreaming: false,
      streamingUserMessage: null,
      streamingAssistantResponse: "",
      error: null,
    }),

  clearChat: () =>
    set({
      activeSessionId: null,
      activeSessionTitle: null,
      runs: [],
      isStreaming: false,
      streamingUserMessage: null,
      streamingAssistantResponse: "",
      streamingRunId: null,
      error: null,
    }),
}));
