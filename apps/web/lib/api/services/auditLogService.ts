import { api } from "../utils/fetchClient";
import type {
  PaginatedAuditLogResponse,
  AuditLogListParams,
} from "../../../types";

export const auditLogService = {
  async listAuditLogs(params?: AuditLogListParams): Promise<PaginatedAuditLogResponse> {
    return await api.get<PaginatedAuditLogResponse>("/audit-logs", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },
};
