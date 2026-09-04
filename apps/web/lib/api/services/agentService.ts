import { api } from "../utils/fetchClient";
import { tokenStorage } from "../utils/tokenStorage";
import type {
  ChatSessionListResponse,
  ChatSessionHistoryResponse,
  ChatSessionSummary,
  RenameSessionRequest,
  AgentChatRequest,
  AgentStreamEvent,
  ToolInvocation,
  GetAgentSessionsParams,
  StreamChatCallbacks,
} from "../../../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const agentService = {
  async listSessions(params?: GetAgentSessionsParams): Promise<ChatSessionListResponse> {
    return await api.get<ChatSessionListResponse>("/agent/sessions", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getSessionHistory(sessionId: string): Promise<ChatSessionHistoryResponse> {
    return await api.get<ChatSessionHistoryResponse>(`/agent/sessions/${sessionId}`);
  },

  async renameSession(sessionId: string, payload: RenameSessionRequest): Promise<ChatSessionSummary> {
    return await api.patch<ChatSessionSummary>(`/agent/sessions/${sessionId}`, payload);
  },

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return await api.delete<{ message: string }>(`/agent/sessions/${sessionId}`);
  },

  async streamChat(
    payload: AgentChatRequest,
    callbacks: StreamChatCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const token = tokenStorage.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/agent/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const err = new Error(`Streaming failed (${response.status}): ${errorText}`);
      callbacks.onError?.(err);
      throw err;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      const err = new Error("Response body is not readable");
      callbacks.onError?.(err);
      throw err;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    let hasReceivedDone = false;
    let finalSessionId = "";
    let finalRunId = "";
    let finalToolsInvoked: ToolInvocation[] | undefined;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const raw = trimmed.slice(6);
            if (raw === "[DONE]") {
              hasReceivedDone = true;
              break;
            }
            try {
              const event: AgentStreamEvent = JSON.parse(raw);
              if (event.session_id) finalSessionId = event.session_id;
              if (event.run_id) finalRunId = event.run_id;

              if (event.type === "token" && event.content) {
                callbacks.onToken(event.content, event.session_id || "");
              } else if (event.type === "done") {
                hasReceivedDone = true;
                if (event.tools_invoked) finalToolsInvoked = event.tools_invoked;
                callbacks.onDone?.(
                  event.session_id || "",
                  event.run_id || "",
                  finalToolsInvoked
                );
              } else if (event.type === "error") {
                hasReceivedDone = true;
                callbacks.onError?.(new Error(event.content || "Agent error occurred"));
              }
            } catch (parseErr) {
              void parseErr;
            }
          }
        }
      }

      if (!hasReceivedDone) {
        callbacks.onDone?.(finalSessionId || payload.session_id || "", finalRunId || "", finalToolsInvoked);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      callbacks.onError?.(err as Error);
      throw err;
    } finally {
      reader.releaseLock();
    }
  },
};
