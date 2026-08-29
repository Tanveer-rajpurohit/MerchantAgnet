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