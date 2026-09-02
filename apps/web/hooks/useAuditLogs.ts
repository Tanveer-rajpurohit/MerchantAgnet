"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { auditLogService } from "../lib/api/services/auditLogService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type { PaginatedAuditLogResponse, AuditLogListParams } from "../types";

export function useInfiniteAuditLogs(params?: Omit<AuditLogListParams, "cursor">) {
  return useInfiniteQuery<PaginatedAuditLogResponse>({
    queryKey: queryKeys.auditLogs.infinite(params as Record<string, unknown>),
    queryFn: ({ pageParam }) =>
      auditLogService.listAuditLogs({
        cursor: pageParam as string | null,
        limit: params?.limit ?? 20,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: tokenStorage.hasTokens(),
  });
}
