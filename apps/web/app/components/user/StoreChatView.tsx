"use client";

import { useRef, useEffect } from "react";
import { AgentOrb } from "../app/utils";
import { StoreItem, Message } from "./types";
import { StoreChatHeader } from "./StoreChatHeader";
import { StoreOrderCard } from "./StoreOrderCard";
import { StoreChatInput } from "./StoreChatInput";

interface StoreChatViewProps {
  store: StoreItem;
  messages: Message[];
  input: string;
  isTyping: boolean;
  onInputChange: (val: string) => void;
  onSend: (text?: string) => void;
  onBack: () => void;
}

export function StoreChatView({
  store,
  messages,
  input,
  isTyping,
  onInputChange,
  onSend,
  onBack,
}: StoreChatViewProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden font-intert">
      <StoreChatHeader store={store} onBack={onBack} />

      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 py-6 w-full">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "customer" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-md ${
                  m.sender === "customer"
                    ? "bg-brand text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-xs sm:text-[13px]"
                    : "bg-surface border border-border text-primary rounded-2xl rounded-bl-xs p-4 text-xs sm:text-[13px] shadow-xs"
                } leading-relaxed`}
              >
                {m.sender === "assistant" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-brand font-semibold mb-1.5">
                    <AgentOrb size={13} className="not-italic text-brand" />
                    <span>{store.name} Copilot</span>
                  </div>
                )}
                <p>{m.text}</p>
              </div>

              {m.cart && <StoreOrderCard cart={m.cart} />}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border text-xs text-muted w-36 shadow-xs">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <span>Checking stock...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <StoreChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        storeName={store.name}
      />
    </div>
  );
}
