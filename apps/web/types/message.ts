export type SenderType = "customer" | "agent" | "merchant";
export type SendStatus = "pending" | "sent" | "failed";

export interface MessageResponse {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  content: string;
  status: SendStatus;
  created_at: string;
}

export interface PaginatedMessageResponse {
  items: MessageResponse[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface MessageSendPayload {
  content: string;
  sender_type?: SenderType;
}
