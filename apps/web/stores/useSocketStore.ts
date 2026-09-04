import { create } from "zustand";
import { useMessageStore } from "./useMessageStore";
import type { MessageResponse, SocketState } from "../types";

function getWsUrl(connectionId: string, role: string): string {
  const customWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (customWsUrl) {
    const cleanBase = customWsUrl.replace(/\/$/, "");
    return `${cleanBase}/ws/chat/${connectionId}?role=${role}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const wsBase = apiUrl
    .replace(/^https:\/\//, "wss://")
    .replace(/^http:\/\//, "ws://")
    .replace(/\/api\/v1\/?$/, "")
    .replace(/\/$/, "");

  return `${wsBase}/ws/chat/${connectionId}?role=${role}`;
}

let pendingQueue: Array<{ content: string; senderType: string }> = [];

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isAiTyping: false,
  currentConnectionId: null,

  setIsAiTyping: (isTyping: boolean) => set({ isAiTyping: isTyping }),

  connect: (connectionId: string, role = "customer") => {
    if (!connectionId) return;

    const currentSocket = get().socket;
    const currentId = get().currentConnectionId;

    if (
      currentSocket &&
      currentId === connectionId &&
      (currentSocket.readyState === WebSocket.OPEN || currentSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (currentSocket) {
      currentSocket.onopen = null;
      currentSocket.onmessage = null;
      currentSocket.onerror = null;
      currentSocket.onclose = null;
      currentSocket.close();
    }

    const url = getWsUrl(connectionId, role);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      set({ isConnected: true, currentConnectionId: connectionId, socket: ws });
      while (pendingQueue.length > 0) {
        const item = pendingQueue.shift();
        if (item) {
          ws.send(JSON.stringify({ content: item.content, sender_type: item.senderType }));
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ai_typing") {
          set({ isAiTyping: Boolean(data.is_typing) });
          return;
        }
        const msg = data.message as MessageResponse | undefined;
        if (msg) {
          set({ isAiTyping: false });
          useMessageStore.getState().appendMessage(msg);
        }
      } catch {
        return;
      }
    };

    ws.onclose = () => {
      set({ isConnected: false, isAiTyping: false, socket: null, currentConnectionId: null });
    };

    ws.onerror = () => {
      set({ isConnected: false, isAiTyping: false });
    };

    set({ socket: ws, currentConnectionId: connectionId, isConnected: false, isAiTyping: false });
  },

  disconnect: () => {
    pendingQueue = [];
    const ws = get().socket;
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      ws.close();
    }
    set({ socket: null, isConnected: false, currentConnectionId: null });
  },

  sendMessage: (content: string, senderType = "customer") => {
    const ws = get().socket;
    const trimmed = content.trim();
    if (!trimmed) return false;

    if (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
      return false;
    }

    if (ws.readyState === WebSocket.CONNECTING) {
      pendingQueue.push({ content: trimmed, senderType });
      return true;
    }

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ content: trimmed, sender_type: senderType }));
      return true;
    }

    return false;
  },
}));
