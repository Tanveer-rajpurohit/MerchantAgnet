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

export interface GetMessagesParams {
  cursor?: string;
  limit?: number;
}

export interface UseRealtimeChatOptions {
  connectionId?: string | null;
  role: "customer" | "merchant";
  enabled?: boolean;
}

export interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isAiTyping: boolean;
  currentConnectionId: string | null;
  connect: (connectionId: string, role?: "customer" | "merchant") => void;
  disconnect: () => void;
  sendMessage: (content: string, senderType?: "customer" | "merchant") => boolean;
  setIsAiTyping: (isTyping: boolean) => void;
}
