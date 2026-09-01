"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, X, CheckCircle2, Clock } from "lucide-react";
import { useCustomerConnectionDetail } from "../../../../hooks/useCustomerConnections";
import { useMessages } from "../../../../hooks/useMessages";
import { useRealtimeChat } from "../../../../hooks/useRealtimeChat";
import { useSocketStore } from "../../../../stores/useSocketStore";
import type { CustomerConnectionResponse } from "../../../../types/customer";

interface ChatViewProps {
  connectionId: string;
}

function getInitials(name: string): string {
  if (!name) return "C";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function CustomerProfilePopup({
  customer,
  onClose,
}: {
  customer: CustomerConnectionResponse;
  onClose: () => void;
}) {
  const isConnected = customer.status === "connected";
  const formattedDate = new Date(customer.created_at).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-intert">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-instrument text-primary">
            Customer Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-sm font-semibold text-secondary">
            {getInitials(customer.customer_name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{customer.customer_name}</p>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <CheckCircle2 size={10} />
                <span>Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20">
                <Clock size={10} />
                <span>Pending</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted">Phone Number</span>
            <p className="text-sm font-medium text-primary mt-0.5">
              {customer.customer_phone || "Not provided"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted">Email Address</span>
            <p className="text-sm font-medium text-primary mt-0.5 truncate">
              {customer.customer_email || "Not provided"}
            </p>
          </div>

          <div className="p-3 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted">Customer Since</span>
            <p className="text-sm font-medium text-primary mt-0.5">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatView({ connectionId }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  const { data: customer, isLoading: isCustomerLoading } =
    useCustomerConnectionDetail(connectionId);

  const {
    messages,
    isLoading: isMessagesLoading,
    isLoadingMore,
    hasMore,
    loadOlderMessages,
  } = useMessages(connectionId);

  const { isConnected: isSocketConnected } = useRealtimeChat({
    connectionId,
    role: "merchant",
    enabled: Boolean(connectionId),
  });

  const isConnected = customer?.status === "connected";

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

  const handleInput = (val: string) => {
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(nextHeight, 24)}px`;
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInput("");

    useSocketStore.getState().sendMessage(trimmed, "merchant");
    setIsSending(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg font-intert overflow-hidden">
      <div className="h-14 flex items-center gap-3.5 px-4 sm:px-6 border-b border-border bg-surface shrink-0">
        <Link
          href="/customers"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Back to Customers"
        >
          <ArrowLeft size={14} />
        </Link>

        {isCustomerLoading || !customer ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse shrink-0" />
            <div className="space-y-1">
              <div className="w-24 h-3.5 bg-surface-muted rounded-sm animate-pulse" />
              <div className="w-16 h-2.5 bg-surface-muted rounded-sm animate-pulse" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-xs font-semibold text-secondary">
              {getInitials(customer.customer_name)}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-primary truncate leading-none">
                  {customer.customer_name}
                </p>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                    <CheckCircle2 size={10} />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium border border-amber-500/20 shrink-0">
                    <Clock size={10} />
                    <span>Pending</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted truncate mt-0.5 leading-none">
                {customer.customer_phone || customer.customer_email || "No contact info"}
              </p>
            </div>
          </button>
        )}

        {isSocketConnected && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </span>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}

        {(isCustomerLoading || isMessagesLoading) && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}

        {!isCustomerLoading && !isMessagesLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted font-intert">
              No messages yet. Start the conversation.
            </p>
          </div>
        )}

        {!isCustomerLoading && !isMessagesLoading && messages.length > 0 &&
          messages.map((msg) => {
            const isMerchant = msg.sender_type === "merchant";
            const isAgent = msg.sender_type === "agent";
            return (
              <div
                key={msg.id}
                className={`flex ${isMerchant ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isMerchant
                      ? "bg-brand text-white rounded-br-xs"
                      : isAgent
                        ? "bg-brand/5 border border-brand/20 text-primary rounded-bl-xs shadow-xs"
                        : "bg-surface border border-border text-primary rounded-bl-xs shadow-xs"
                  }`}
                >
                  {isAgent && (
                    <span className="block text-[10px] text-brand font-semibold mb-1">
                      AI Copilot (Auto-reply)
                    </span>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      isMerchant ? "text-white/70 text-right" : "text-muted"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="p-3 sm:p-4 border-t border-border bg-surface shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply..."
            className="flex-1 resize-none px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs max-h-32"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl btn-brand-solid flex items-center justify-center shrink-0 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      {showProfile && customer && (
        <CustomerProfilePopup
          customer={customer}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
