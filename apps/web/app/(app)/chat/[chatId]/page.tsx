"use client";

import { useState, useRef, useEffect } from "react";
import { ChatInput } from "../../../components/app";
import type { ActionMode } from "../../../components/app";
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

export default function ChatSessionPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => {
      setChatId(p.chatId);
      setMessages([
        {
          id: "m-init-1",
          role: "user",
          content: "Show me recent payment links and check low stock products",
        },
        {
          id: "m-init-2",
          role: "assistant",
          content:
            "Here is your store snapshot: 3 payment links were settled today totaling ₹2,450. In your catalog, Amul Milk 1L is currently at 4 units (below your alert threshold of 10).",
          actionType: "catalog",
          metadata: { itemsCount: 1 },
        },
      ]);
    });
  }, [params]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string, mode: ActionMode) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2, 9),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

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
            "Generated a new Razorpay payment link in test-mode. Customer link is active and ready for dispatch.",
          actionType: "payment_link",
          metadata: {
            linkUrl: "https://rzp.io/l/test_pay_custom",
            amount: "₹650.00",
            customerName: "Customer",
          },
        };
      } else {
        assistantMsg = {
          id: Math.random().toString(36).slice(2, 9),
          role: "assistant",
          content: "Action processed successfully on your merchant catalog.",
          actionType: "general",
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted bg-surface-muted px-2 py-0.5 rounded-md border border-border">
            ID: {chatId || "session"}
          </span>
          <span className="text-sm font-medium font-intert text-primary truncate">
            Merchant Conversation
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
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

                {msg.actionType === "payment_link" && msg.metadata?.linkUrl && (
                  <div className="mt-3 p-3 rounded-xl bg-bg border border-border flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-muted block truncate">
                        {msg.metadata.linkUrl}
                      </span>
                      <span className="text-xs font-semibold text-primary font-intert">
                        {msg.metadata.amount} for {msg.metadata.customerName}
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
            placeholder="Reply to MerchantAgent..."
          />
        </div>
      </div>
    </div>
  );
}
