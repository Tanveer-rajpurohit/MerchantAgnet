export type AgentPersona = "merchant_admin" | "customer_shopfront";

export type AgentRunStatus = "success" | "failed" | "fallback";

export interface ToolInvocation {
  tool: string;
  args: Record<string, unknown>;
  content?: string;
  result?: Record<string, unknown>;
}

export interface AgentRunRecord {
  id: string;
  session_id: string | null;
  merchant_id: string;
  persona: AgentPersona;
  user_message: string;
  agent_response: string;
  tools_invoked: ToolInvocation[];
  status: AgentRunStatus;
  latency_ms: number | null;
  created_at: string;
}

export interface ChatSessionSummary {
  session_id: string;
  title: string;
  last_message: string;
  last_active_at: string;
  total_turns: number;
}

export interface ChatSessionListResponse {
  sessions: ChatSessionSummary[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface ChatSessionHistoryResponse {
  session_id: string;
  runs: AgentRunRecord[];
  total_turns: number;
}

export interface RenameSessionRequest {
  title: string;
}

export interface AttachedCustomerDTO {
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_connection_id?: string | null;
  customer_id?: string | null;
}

export interface AgentChatRequest {
  message: string;
  session_id?: string | null;
  persona?: AgentPersona;
  target_customer_id?: string | null;
  target_customer_connection_id?: string | null;
  target_customer_name?: string | null;
  target_customer_phone?: string | null;
  target_customers?: AttachedCustomerDTO[] | null;
}

export interface AgentStreamEvent {
  type: "token" | "done" | "error";
  content?: string;
  session_id?: string;
  run_id?: string;
}
