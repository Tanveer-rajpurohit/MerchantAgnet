import type { LucideIcon } from "lucide-react";

export type AgentPersona = "merchant_admin" | "customer_shopfront";

export type ActionMode = "default" | "payment-link" | "catalog" | "campaign";

export interface SuggestionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  prompt: string;
  mode: ActionMode;
}

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
  tools_invoked?: ToolInvocation[];
}

export interface GetAgentSessionsParams {
  cursor?: string;
  limit?: number;
}

export interface StreamChatCallbacks {
  onToken: (token: string, sessionId: string) => void;
  onDone?: (sessionId: string, runId: string, toolsInvoked?: ToolInvocation[]) => void;
  onError?: (error: Error) => void;
}

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
  finishStreaming: (sessionId: string, runId: string, toolsInvoked?: ToolInvocation[]) => void;
  setStreamingError: (error: string) => void;
  resetStream: () => void;
  clearChat: () => void;
}

export interface AgentStep {
  id: string;
  label: string;
  detail?: string;
  status: "completed" | "in_progress" | "pending";
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  threshold: number;
  sellingPrice: string;
  status: "low" | "ok" | "critical";
}

export interface RevenueMetric {
  thisWeek: number;
  lastWeek: number;
  growthPercent: number;
  totalOrders: number;
  avgOrderValue: number;
  paymentMethods: {
    upi: number;
    card: number;
    netbanking: number;
  };
  aiInsight: string;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: {
    durationSeconds: number;
    summary?: string;
    steps?: AgentStep[];
    detailedThought?: string;
  };
  paymentLink?: {
    customerName: string;
    customerPhone?: string;
    amount: string;
    description: string;
    linkUrl: string;
    status?: "active" | "paid" | "expired";
  };
  catalogStock?: {
    title?: string;
    items: StockItem[];
  };
  campaignGate?: {
    campaignId?: string;
    campaignName: string;
    segmentDescription: string;
    targetCount: number;
    discountPercent: string;
    offerMessage?: string;
    suggestedMessage?: string;
    projectedRevenue?: string;
    approved?: boolean;
  };
  revenueSummary?: RevenueMetric;
  rateLimit?: {
    isRateLimited?: boolean;
    title?: string;
    detail?: string;
    cooldownSeconds?: number;
  };
}

