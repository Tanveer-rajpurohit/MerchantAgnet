"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowUp, X, CheckCircle2, Clock, Smile } from "lucide-react";
import { useCustomerConnectionDetail } from "../../../../hooks/useCustomerConnections";
import { useMessages } from "../../../../hooks/useMessages";
import { useRealtimeChat } from "../../../../hooks/useRealtimeChat";
import { useSocketStore } from "../../../../stores/useSocketStore";
import { AgentOrb } from "../utils";
import type { CustomerConnectionResponse } from "../../../../types";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const RZP_URL_REGEX =
  /https?:\/\/(?:rzp\.io\/[a-zA-Z0-9_\-\/]+|api\.razorpay\.com\/[a-zA-Z0-9_\-\/]+)/i;

function extractAmount(text: string): number | null {
  const matches = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (matches && matches[1]) {
    const clean = matches[1].replace(/,/g, "");
    const n = parseFloat(clean);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return null;
}

function buildPaymentCard(content: string): {
  linkUrl: string;
  amount: string;
  description: string;
} | null {
  const urlMatch = content.match(RZP_URL_REGEX);
  if (!urlMatch) return null;
  const linkUrl = urlMatch[0];
  const amount = extractAmount(content);
  return {
    linkUrl,
    amount: amount ? String(amount) : "",
    description: "Payment for your order",
  };
}

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
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const isAtBottomRef = useRef<boolean>(true);

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

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setIsEmojiOpen(false);
      }
    }
    if (isEmojiOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmojiOpen]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isAtBottomRef.current = distanceFromBottom < 100;

    if (!hasMore || isLoadingMore) return;

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
      isAtBottomRef.current = true;
      return;
    }

    if (prevScrollHeightRef.current > 0) {
      const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop += heightDiff;
      prevScrollHeightRef.current = 0;
      return;
    }

    if (isAtBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 1500);
    } catch {}
  };

  const handleInput = (val: string) => {
    setInput(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${Math.max(nextHeight, 38)}px`;
      textareaRef.current.style.overflowY = textareaRef.current.scrollHeight > 120 ? "auto" : "hidden";
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setInput("");
    setIsEmojiOpen(false);

    useSocketStore.getState().sendMessage(trimmed, "merchant");
    setIsSending(false);

    isAtBottomRef.current = true;
    scrollToBottom("auto");
    requestAnimationFrame(() => scrollToBottom("auto"));
    setTimeout(() => scrollToBottom("auto"), 50);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.overflowY = "hidden";
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
            const isCustomer = msg.sender_type === "customer";
            const payCard = buildPaymentCard(msg.content);
            return (
              <div
                key={msg.id}
                className={`flex ${isMerchant ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isMerchant
                      ? "bg-brand text-white rounded-br-xs shadow-xs"
                      : isAgent
                        ? "bg-brand/10 dark:bg-brand/15 border border-brand/25 text-primary rounded-bl-xs shadow-xs"
                        : "bg-surface border border-border text-primary rounded-bl-xs shadow-xs"
                  }`}
                >
                  {isAgent && (
                    <div className="flex items-center gap-1.5 text-[10px] text-brand font-semibold mb-1">
                      <AgentOrb animated size={12} className="text-brand not-italic shrink-0" />
                      <span>AI Copilot (Auto-reply)</span>
                    </div>
                  )}
                  {isCustomer && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-secondary mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                      <span className="truncate">{customer?.customer_name || "Customer"}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                  {payCard && (
                    <div
                      className={`mt-2.5 rounded-xl p-2.5 sm:p-3 ${
                        isMerchant
                          ? "border border-white/20 bg-black/15 text-white"
                          : "border border-brand/20 bg-brand/5 text-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            isMerchant ? "text-white/90" : "text-brand"
                          }`}
                        >
                          🔗 Payment Link
                        </span>
                        {payCard.amount && (
                          <span
                            className={`text-xs sm:text-sm font-instrument font-semibold ${
                              isMerchant ? "text-white" : "text-primary"
                            }`}
                          >
                            ₹{Number(payCard.amount).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <code
                        className={`block text-[11px] font-mono mb-2 truncate ${
                          isMerchant ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {payCard.linkUrl}
                      </code>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(payCard.linkUrl)}
                          className={`flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                            isMerchant
                              ? "border border-white/30 bg-white/10 hover:bg-white/20 text-white"
                              : "border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary"
                          }`}
                        >
                          {copiedUrl === payCard.linkUrl ? "Copied ✓" : "Copy Link"}
                        </button>
                        <a
                          href={payCard.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                            isMerchant
                              ? "bg-white text-brand hover:bg-white/90"
                              : "btn-brand-solid"
                          }`}
                        >
                          {isMerchant ? "Open Link →" : "Pay Now →"}
                        </a>
                      </div>
                    </div>
                  )}

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
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 border-t border-border bg-surface shrink-0">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2" ref={emojiRef}>
          {isEmojiOpen && (
            <div className="absolute bottom-full left-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  handleInput(input + emojiData.emoji);
                  setIsEmojiOpen(false);
                }}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                height={380}
                width={320}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsEmojiOpen((v) => !v)}
            title="Insert emoji"
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors shrink-0 cursor-pointer ${
              isEmojiOpen
                ? "bg-brand/15 text-brand"
                : "text-muted hover:text-secondary hover:bg-surface-muted"
            }`}
          >
            <Smile size={18} />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a reply..."
            className="flex-1 resize-none px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-border bg-bg text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs max-h-32 overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ minHeight: "38px" }}
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
