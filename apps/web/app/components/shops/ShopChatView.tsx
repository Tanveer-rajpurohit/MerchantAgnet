"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ArrowLeft, Send, Store } from "lucide-react";
import { AgentOrb } from "../app/utils";
import { useAuth } from "../../../context/AuthContext";
import { useShopDetail } from "../../../hooks/useShops";
import { useMessages } from "../../../hooks/useMessages";
import { useRealtimeChat } from "../../../hooks/useRealtimeChat";
import { useSocketStore } from "../../../stores/useSocketStore";
import { useCreateCustomerConnection } from "../../../hooks/useCustomerConnections";
import { LoginToChatCard } from "./LoginToChatCard";
import type { ShopListItem } from "../../../types/shop";
import type { CustomerConnectionResponse } from "../../../types/customer";

interface ShopChatViewProps {
  shop: ShopListItem;
  onBack: () => void;
}

export function ShopChatView({ shop, onBack }: ShopChatViewProps) {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [createdConnection, setCreatedConnection] =
    useState<CustomerConnectionResponse | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  const { data: detail, isLoading: isDetailLoading } = useShopDetail(shop.id);

  const connectionId =
    createdConnection?.id || detail?.customer_connection_id || null;

  const {
    messages,
    isLoading: isMessagesLoading,
    isLoadingMore,
    hasMore,
    loadOlderMessages,
  } = useMessages(connectionId);

  const { isConnected } = useRealtimeChat({
    connectionId,
    role: "customer",
    enabled: Boolean(connectionId),
  });

  const createConnectionMutation = useCreateCustomerConnection();

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    if (container.scrollTop <= 40) {
      prevScrollHeightRef.current = container.scrollHeight;
      loadOlderMessages();
    }
  };

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (isInitialLoadRef.current && messages.length > 0) {
      isInitialLoadRef.current = false;
      container.scrollTop = container.scrollHeight;
      return;
    }

    if (prevScrollHeightRef.current > 0) {
      const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += heightDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages]);

  useEffect(() => {
    if (isSending) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isSending]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col h-full min-h-0 bg-bg font-intert">
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-surface shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
            title="Back to Stores"
          >
            <ArrowLeft size={14} />
          </button>
        </div>
        <LoginToChatCard storeName={shop.business_name} redirectUrl="/shops" />
      </div>
    );
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInput("");

    try {
      let targetConnectionId = connectionId;
      if (!targetConnectionId) {
        const created = await createConnectionMutation.mutateAsync({
          merchant_id: shop.id,
        });
        setCreatedConnection(created);
        targetConnectionId = created.id;
        useSocketStore.getState().connect(created.id, "customer");
      }

      if (targetConnectionId) {
        useSocketStore.getState().sendMessage(text, "customer");
      }
    } catch {
      setInput(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-bg font-intert overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
            title="Back to Stores"
          >
            <ArrowLeft size={14} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-medium text-xs shrink-0">
              <Store size={14} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-primary line-clamp-1">
                {shop.business_name}
              </h2>
              <span className="text-[10px] text-muted block">
                {shop.business_type} • {shop.city || "India"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connectionId && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{isConnected ? "Live Chat" : "Connecting"}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-medium">
            <AgentOrb size={11} className="text-brand not-italic" />
            <span>Active Copilot</span>
          </span>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6 w-full"
      >
        <div className="mx-auto max-w-3xl space-y-4">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          )}

          {(isDetailLoading || isMessagesLoading) && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          )}

          {!isDetailLoading && !isMessagesLoading && messages.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface">
              <Store size={28} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-medium text-primary">
                Chat with {shop.business_name}
              </p>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Ask about current stock, prices, or orders. The store will reply directly
                or via AI copilot.
              </p>
            </div>
          )}

          {!isDetailLoading && !isMessagesLoading && messages.length > 0 &&
            messages.map((m) => {
              const isCustomer = m.sender_type === "customer";
              const isAgent = m.sender_type === "agent";
              const bubbleStyle = isCustomer
                ? "bg-brand text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-xs sm:text-[13px]"
                : isAgent
                  ? "bg-surface border border-brand/25 text-primary rounded-2xl rounded-bl-xs p-4 text-xs sm:text-[13px] shadow-xs"
                  : "bg-surface border border-border text-primary rounded-2xl rounded-bl-xs p-4 text-xs sm:text-[13px] shadow-xs";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-md ${bubbleStyle} leading-relaxed`}>
                    {!isCustomer && (
                      <div className="flex items-center gap-1.5 text-[11px] text-brand font-semibold mb-1">
                        <AgentOrb size={12} className="not-italic text-brand" />
                        <span>
                          {isAgent ? `AI Copilot • ${shop.business_name}` : `${shop.business_name} (Merchant)`}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  <span className="text-[9px] text-muted mt-1 px-1">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-border bg-surface shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${shop.business_name}...`}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-4 py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
