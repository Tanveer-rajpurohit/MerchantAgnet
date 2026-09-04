import type { MessageResponse } from "../message/types";

export type ConnectionStatus = "pending" | "connected";

export interface CustomerConnectionCreatePayload {
  merchant_id: string;
  customer_id?: string;
}

export interface CustomerConnectionResponse {
  id: string;
  merchant_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email: string;
  customer_profile_picture?: string | null;
  status: ConnectionStatus;
  messages_used: number;
  total_spent: number | string;
  conversation_id?: string | null;
  last_message?: MessageResponse | null;
  connected_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCustomerConnectionResponse {
  items: CustomerConnectionResponse[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: "Connected" | "Pending";
  totalSpent: string;
  lastActivity: string;
  messagesUsed: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
}

export interface ChatMessage {
  id: string;
  sender: "merchant" | "customer";
  text: string;
  time: string;
}

export interface GetCustomerConnectionsParams {
  cursor?: string;
  limit?: number;
  status?: string;
  search?: string;
}

