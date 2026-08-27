"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput, ChatSuggestions } from "../../components/app";
import type { ActionMode } from "../../components/app";
import { Sparkles, Check, Copy } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actionType?: "payment_link" | "catalog" | "campaign" | "general";
  metadata?: {
    linkUrl?: string;
    amount?: string;
    customerName?: string;
    itemsCount?: number;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setQuery("");
      setIsTyping(false);
      window.history.replaceState(null, "", "/chat");
    };

    window.addEventListener("mag:new-chat", handleNewChat);
    return () => window.removeEventListener("mag:new-chat", handleNewChat);
  }, []);

  const handleSend = (text: string, mode: ActionMode) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2, 9),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    const chatId = Math.random().toString(36).slice(2, 9);
    window.history.replaceState(null, "", `/chat/${chatId}`);

    setTimeout(() => {
      let assistantMsg: ChatMessage;

      if (
        mode === "payment-link" ||
        text.toLowerCase().includes("link") ||
        text.toLowerCase().includes("₹")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "I have created a verified test-mode Razorpay payment link for ₹500.00 for customer Rahul with instant SMS & WhatsApp dispatch ready.",
          actionType: "payment_link",
          metadata: {
            linkUrl: "https://rzp.io/l/test_rahul_500",
            amount: "₹500.00",
            customerName: "Rahul",
          },
        };
      } else if (
        mode === "catalog" ||
        text.toLowerCase().includes("stock") ||
        text.toLowerCase().includes("inventory")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "Live catalog scan complete. 2 items are currently below your safety threshold: Amul Milk 1L (4 units remaining, threshold 10) and Fortune Oil 1L (2 units remaining, threshold 5).",
          actionType: "catalog",
          metadata: { itemsCount: 2 },
        };
      } else if (
        mode === "campaign" ||
        text.toLowerCase().includes("diwali") ||
        text.toLowerCase().includes("discount")
      ) {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "Drafted a 10% festival discount campaign batch for your top 20 repeat customers. This batch requires your explicit merchant approval before any message or link is dispatched.",
          actionType: "campaign",
          metadata: { itemsCount: 20 },
        };
      } else {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content:
            "I'm ready to manage your store actions. You can ask me to generate Razorpay payment links, query live stock across your catalog, or draft gated customer campaigns.",
          actionType: "general",
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleSelectSuggestion = (prompt: string) => {
    handleSend(prompt, "default");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-instrument text-primary tracking-tight">
                What can I help with?
              </h1>
              <p className="mt-2 text-sm text-muted font-intert">
                Ask your AI merchant assistant anything about your store.
              </p>
            </div>

            <ChatInput
              value={query}
              onChange={setQuery}
              onSubmit={handleSend}
              autoFocus
              placeholder="Ask anything about payment links, stock, or campaigns..."
            />

            <ChatSuggestions onSelect={handleSelectSuggestion} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-intert leading-relaxed transition-all ${
                      msg.role === "user"
                        ? "bg-surface-muted border border-border text-primary"
                        : "bg-surface border border-border text-primary"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mb-2">
                        <Sparkles size={13} />
                        <span>MerchantAgent</span>
                      </div>
                    )}

                    <p className="text-[14px] text-primary leading-relaxed">
                      {msg.content}
                    </p>

                    {msg.actionType === "payment_link" &&
                      msg.metadata?.linkUrl && (
                        <div className="mt-3 p-3 rounded-xl bg-bg border border-border flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-mono text-muted block truncate">
                              {msg.metadata.linkUrl}
                            </span>
                            <span className="text-xs font-semibold text-primary font-intert">
                              {msg.metadata.amount} for{" "}
                              {msg.metadata.customerName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(msg.metadata!.linkUrl!, msg.id)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-muted text-xs font-medium font-intert text-primary transition-colors shrink-0"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-in fade-in">
                  <div className="bg-surface border border-border rounded-2xl px-4 py-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-brand animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-border px-4 sm:px-6 py-4 bg-bg">
            <div className="mx-auto max-w-2xl">
              <ChatInput
                value={query}
                onChange={setQuery}
                onSubmit={handleSend}
                autoFocus
                placeholder="Reply to MerchantAgent..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
