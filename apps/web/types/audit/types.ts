export type AuditActor = "AI Agent" | "Merchant" | "System";
export type AuditStatus = "Success" | "Failed";

export interface AuditLogEntry {
  id: string;
  actionType: string;
  description: string;
  actor: AuditActor;
  status: AuditStatus;
  errorDetail?: string;
  timestamp: string;
}

export interface AuditLogRecord {
  id: string;
  merchant_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PaginatedAuditLogResponse {
  items: AuditLogRecord[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface AuditLogListParams {
  cursor?: string | null;
  limit?: number;
}
