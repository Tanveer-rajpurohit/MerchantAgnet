export type ConnectionStatus = "Connected" | "Pending";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  status: ConnectionStatus;
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
