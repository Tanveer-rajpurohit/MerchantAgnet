"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../lib/api/services/agentService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  ChatSessionListResponse,
  ChatSessionHistoryResponse,
  ChatSessionSummary,
  RenameSessionRequest,
} from "../types";

export function useInfiniteAgentSessions(limit = 20) {
  return useInfiniteQuery<ChatSessionListResponse>({
    queryKey: queryKeys.agent.sessions({ limit }),
    queryFn: ({ pageParam }) =>
      agentService.listSessions({
        cursor: (pageParam as string) || undefined,
        limit,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: tokenStorage.hasTokens(),
  });
}

export function useSessionHistory(sessionId: string | null) {
  return useQuery<ChatSessionHistoryResponse>({
    queryKey: queryKeys.agent.sessionHistory(sessionId || ""),
    queryFn: () => agentService.getSessionHistory(sessionId!),
    enabled: Boolean(sessionId && tokenStorage.hasTokens()),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRenameSession() {
  const queryClient = useQueryClient();

  return useMutation<ChatSessionSummary, Error, { sessionId: string; payload: RenameSessionRequest }>({
    mutationFn: ({ sessionId, payload }) => agentService.renameSession(sessionId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
      queryClient.setQueryData(queryKeys.agent.sessionHistory(data.session_id), (prev: ChatSessionHistoryResponse | undefined) => {
        if (!prev) return prev;
        return { ...prev };
      });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (sessionId: string) => agentService.deleteSession(sessionId),
    onSuccess: (_, deletedSessionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agent.all });
      queryClient.removeQueries({ queryKey: queryKeys.agent.sessionHistory(deletedSessionId) });
    },
  });
}
