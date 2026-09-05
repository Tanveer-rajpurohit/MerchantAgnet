"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Send, Store, Smile, Volume2, Square, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AgentOrb } from "../app/utils";
import { useAuth } from "../../../context/AuthContext";
import { useShopDetail } from "../../../hooks/useShops";
import { useMessages } from "../../../hooks/useMessages";
import { useRealtimeChat } from "../../../hooks/useRealtimeChat";
import { useSocketStore } from "../../../stores/useSocketStore";
import { useCreateCustomerConnection } from "../../../hooks/useCustomerConnections";
import { useTTS } from "../../../hooks/useTTS";
import { LoginToChatCard } from "./LoginToChatCard";
import type { ShopListItem, CustomerConnectionResponse } from "../../../types";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface ShopChatViewProps {
  shop: ShopListItem;
  onBack: () => void;
}

const RZP_URL_REGEX =
  /https?:\/\/(?:rzp\.io\/[a-zA-Z0-9_\-/]+|[\w-]+\.razorpay\.com\/[^\s)"'<>]+)/i;

function extractAmount(text: string): number | null {
  const m = text.match(
    /(?:AMOUNT|Amount|Total|total|₹|Rs\.?)\s*[:=]?\s*(?:₹|INR\s*|Rs\.?)?\s*([\d,]+(?:\.\d+)?)/i
  );
  if (m && m[1]) {
    const n = Number(m[1].replace(/,/g, ""));
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

export function ShopChatView({ shop, onBack }: ShopChatViewProps) {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [createdConnection, setCreatedConnection] =
    useState<CustomerConnectionResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const isAtBottomRef = useRef(true);

  const {
    speak,
    stop,
    status: ttsStatus,
    activeId: ttsActiveId,
    supported: ttsSupported,
  } = useTTS();
  const isAiTyping = useSocketStore((s) => s.isAiTyping);

  const { data: detail, isLoading: isDetailLoading } = useShopDetail(shop.id);

  const existingConnId =
    "customer_connection_id" in shop
      ? ((shop as unknown as { customer_connection_id?: string | null }).customer_connection_id || null)
      : null;

  const connectionId =
    createdConnection?.id || existingConnId || detail?.customer_connection_id || null;

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

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

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

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom("auto");
    }
  }, [messages.length, isSending, isAiTyping]);

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
    setIsEmojiOpen(false);

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
        useSocketStore.getState().setIsAiTyping(true);
        isAtBottomRef.current = true;
        scrollToBottom("auto");
        requestAnimationFrame(() => scrollToBottom("auto"));
        setTimeout(() => scrollToBottom("auto"), 50);
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      void e;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-bg font-intert overflow-hidden animate-in fade-in-50 duration-150">
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

          {((isDetailLoading && !connectionId) || (Boolean(connectionId) && isMessagesLoading)) && messages.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          )}

          {!isDetailLoading && !isMessagesLoading && messages.length === 0 && (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-surface animate-in fade-in-50 duration-150">
              <Store size={28} className="mx-auto text-muted mb-2" />
              <p className="text-sm font-medium text-primary">
                Chat with {shop.business_name}
              </p>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Ask about current stock, prices, or orders. The store will reply
                directly or via AI copilot.
              </p>
            </div>
          )}

          {messages.length > 0 &&
            messages.map((m) => {
              const isCustomer = m.sender_type === "customer";
              const isAgent = m.sender_type === "agent";
              const isMerchant = m.sender_type === "merchant";
              const bubbleStyle = isCustomer
                ? "bg-brand text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-xs sm:text-[13px] shadow-xs"
                : isMerchant
                  ? "bg-brand/10 dark:bg-brand/15 border border-brand/30 text-primary rounded-2xl rounded-bl-xs p-4 text-xs sm:text-[13px] shadow-xs ring-1 ring-brand/15"
                  : "bg-surface border border-border text-primary rounded-2xl rounded-bl-xs p-4 text-xs sm:text-[13px] shadow-xs";

              const payCard = !isCustomer ? buildPaymentCard(m.content) : null;
              const isThisActive = ttsActiveId === m.id;
              const isThisLoading = isThisActive && ttsStatus === "loading";
              const isThisSpeaking = isThisActive && ttsStatus === "speaking";

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-md ${bubbleStyle} leading-relaxed`}>
                    {!isCustomer && (
                      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isAgent ? (
                            <>
                              <AgentOrb animated size={16} state="composing" className="not-italic text-brand shrink-0" />
                              <span className="truncate text-brand">
                                AI Copilot • {shop.business_name}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-5 h-5 rounded-md bg-brand/15 text-brand flex items-center justify-center shrink-0">
                                <Store size={12} />
                              </span>
                              <span className="truncate text-brand font-semibold">
                                {shop.business_name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand/15 text-brand font-medium border border-brand/25 shrink-0">
                                Store Owner
                              </span>
                            </>
                          )}
                        </div>
                        {ttsSupported && (
                          <button
                            type="button"
                            onClick={() =>
                              isThisSpeaking || isThisLoading
                                ? stop()
                                : speak(m.content, undefined, undefined, m.id)
                            }
                            title={
                              isThisLoading
                                ? "Preparing speech..."
                                : isThisSpeaking
                                  ? "Stop playback"
                                  : "Listen to message"
                            }
                            className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all cursor-pointer shrink-0 shadow-2xs ${
                              isThisSpeaking
                                ? "bg-brand/15 border-brand/40 text-brand ring-2 ring-brand/20 animate-pulse"
                                : isThisLoading
                                  ? "bg-surface-muted border-border text-brand"
                                  : "bg-surface border-border/70 text-secondary hover:text-primary hover:border-brand/40 hover:bg-surface-muted"
                            }`}
                          >
                            {isThisLoading ? (
                              <Loader2 size={13} className="animate-spin text-brand" />
                            ) : isThisSpeaking ? (
                              <Square size={11} className="fill-current text-brand" />
                            ) : (
                              <Volume2 size={13} />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {isCustomer ? (
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    ) : (
                      <div className="max-w-none text-xs sm:text-[13px] text-secondary leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <div className="w-full max-w-full my-2.5 overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
                                <table className="w-full text-left text-xs border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-surface-muted/50 border-b border-border">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="divide-y divide-border/50 text-secondary">
                                {children}
                              </tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-surface-muted/25 transition-colors">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 text-secondary first:text-primary first:font-medium leading-relaxed">
                                {children}
                              </td>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-base font-bold text-primary mt-3 mb-1.5">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-sm font-semibold text-primary mt-2.5 mb-1">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xs font-semibold text-primary mt-2 mb-1">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-secondary leading-relaxed my-1 [&:first-child]:mt-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-primary">{children}</strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 my-1.5 space-y-1 text-secondary marker:text-primary">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 my-1.5 space-y-1 text-secondary marker:text-primary">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed pl-0.5">{children}</li>
                            ),
                            code: ({ children, className }) => {
                              const isBlock = Boolean(className?.startsWith("language-"));
                              if (isBlock) {
                                return <code className="font-mono text-xs text-secondary">{children}</code>;
                              }
                              return (
                                <code className="font-mono text-xs bg-surface-muted px-1 py-0.5 rounded border border-border text-brand font-medium">
                                  {children}
                                </code>
                              );
                            },
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-brand/30 pl-3 my-2 text-secondary italic">{children}</blockquote>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {payCard && (
                      <div className="mt-3 rounded-xl border border-brand/20 bg-brand/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold text-brand uppercase tracking-wide">
                            🔗 Payment Link
                          </span>
                          {payCard.amount && (
                            <span className="text-sm font-instrument font-semibold text-primary">
                              ₹{Number(payCard.amount).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <code className="block text-[11px] text-muted font-mono mb-2 truncate">
                          {payCard.linkUrl}
                        </code>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(payCard.linkUrl)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-secondary hover:text-primary text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            {copied ? "Copied ✓" : "Copy Link"}
                          </button>
                          <a
                            href={payCard.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-1.5 rounded-lg btn-brand-solid text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Pay Now →
                          </a>
                        </div>
                      </div>
                    )}
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

          {isAiTyping && (
            <div className="flex flex-col items-start animate-in fade-in duration-200">
              <div className="max-w-[85%] sm:max-w-md bg-surface border border-brand/25 text-primary rounded-2xl rounded-bl-xs p-3.5 text-xs sm:text-[13px] shadow-xs">
                <div className="flex items-center gap-2">
                  <AgentOrb animated size={18} state="working" className="text-brand not-italic shrink-0" />
                  <span className="text-[11px] font-semibold text-brand">
                    AI Copilot • {shop.business_name}
                  </span>
                  <span className="text-[10px] text-muted ml-auto font-medium">
                    Thinking...
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2.5 px-1 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[11px] text-muted ml-1">Analyzing store items & preparing reply...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-border bg-surface shrink-0">
        <div className="max-w-3xl mx-auto relative" ref={emojiRef}>
          {isEmojiOpen && (
            <div className="absolute bottom-full left-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-border">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setInput((prev) => prev + emojiData.emoji);
                  setIsEmojiOpen(false);
                }}
                autoFocusSearch={false}
                lazyLoadEmojis={true}
                height={380}
                width={320}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEmojiOpen((v) => !v)}
              title="Insert emoji"
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors shrink-0 cursor-pointer ${
                isEmojiOpen
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Smile size={16} />
            </button>

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
              className="px-4 py-2.5 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
