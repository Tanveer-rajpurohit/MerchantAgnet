import { create } from "zustand";
import type { AgentRunRecord } from "../types";

export interface AgentChatState {
  activeSessionId: string | null;
  activeSessionTitle: string | null;
  runs: AgentRunRecord[];
  isStreaming: boolean;
  streamingUserMessage: string | null;
  streamingAssistantResponse: string;
  streamingRunId: string | null;
  error: string | null;

  setActiveSession: (sessionId: string | null, title?: string | null) => void;
  setRuns: (runs: AgentRunRecord[]) => void;
  appendRun: (run: AgentRunRecord) => void;
  startStreaming: (userMessage: string, sessionId?: string | null) => void;
  appendStreamToken: (token: string) => void;
  finishStreaming: (sessionId: string, runId: string) => void;
  setStreamingError: (error: string) => void;
  resetStream: () => void;
  clearChat: () => void;
}

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

  finishStreaming: (sessionId, runId) =>
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
        tools_invoked: [],
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
    set({
      isStreaming: false,
      error,
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
