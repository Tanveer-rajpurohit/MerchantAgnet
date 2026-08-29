"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Lock, Paperclip, X } from "lucide-react";
import type { Customer, ChatMessage } from "../../../types/customer";
import { MESSAGE_LIMIT } from "./data";

interface ChatViewProps {
  customer: Customer;
  messages: ChatMessage[];
}

function getInitials(name: string): string {
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
  customer: Customer;
  onClose: () => void;
}) {
  const joinedDate = "Aug 2026";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-instrument text-primary">
            Customer Details
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-surface-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-surface-muted flex items-center justify-center text-sm font-medium text-secondary">
            {getInitials(customer.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-primary">{customer.name}</p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                <span>Connected</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted font-intert">Phone</span>
            <p className="text-sm font-medium font-intert text-primary mt-0.5">
              {customer.phone}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Total Spent
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                {customer.totalSpent}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-border bg-bg">
              <span className="text-[11px] text-muted font-intert">
                Last Active
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                {customer.lastActivity}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-bg">
            <span className="text-[11px] text-muted font-intert">
              Customer Since
            </span>
            <p className="text-sm font-medium font-intert text-primary mt-0.5">
              {joinedDate}
            </p>
          </div>

          {customer.status === "Pending" && (
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-intert">
                Messages Used
              </span>
              <p className="text-sm font-medium font-intert text-primary mt-0.5">
                {customer.messagesUsed} of {MESSAGE_LIMIT}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatView({ customer, messages }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);
  const [showProfile, setShowProfile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MESSAGE_LIMIT - customer.messagesUsed;
  const isBlocked = customer.status === "Pending" && remaining <= 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

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
    if (!trimmed || isBlocked) return;

    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "merchant",
      text: trimmed,
      time: "Just now",
    };
    setLocalMessages((prev) => [...prev, newMsg]);
    setInput("");
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3.5 px-4 sm:px-6 py-[9px] border-b border-border bg-surface shrink-0">
        <Link
          href="/customers"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-bg hover:bg-surface-muted text-muted hover:text-primary transition-colors cursor-pointer shrink-0"
          title="Back to Stores"
        >
          <ArrowLeft size={14} />
        </Link>

        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-xs font-medium text-secondary">
            {getInitials(customer.name)}
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-primary truncate">
                {customer.name}
              </p>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                <span>Connected</span>
              </span>
            </div>
            <p className="text-xs text-muted truncate">
              {customer.phone}
              {customer.totalSpent !== "₹0" &&
                ` · ${customer.totalSpent} spent`}
            </p>
          </div>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3"
      >
        {localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted font-intert">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          localMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "merchant" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] sm:max-w-[60%] px-3.5 py-2.5 rounded-2xl ${
                  msg.sender === "merchant"
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-surface border border-border text-primary rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed break-words">
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === "merchant" ? "text-white/60" : "text-muted"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 sm:px-6 py-3 border-t border-border bg-bg shrink-0">
        {isBlocked ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-muted text-muted text-xs font-intert">
            <Lock size={13} />
            Message limit reached. This contact needs to make a purchase or
            accept your connection request.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-bg focus-within:border-brand/50 transition-all">
            <div className="px-4 pt-3 pb-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full resize-none bg-transparent text-sm text-primary font-intert outline-none placeholder:text-muted/60 leading-relaxed max-h-[120px] overflow-y-auto"
                style={{ minHeight: "24px" }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <button
                type="button"
                title="Attach media"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-secondary hover:bg-surface-muted transition-colors"
              >
                <Paperclip size={15} />
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex items-center justify-center w-8 h-8 rounded-lg btn-brand-solid disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
        {customer.status === "Pending" && !isBlocked && (
          <p className="text-[10px] text-muted font-intert mt-1.5 px-1">
            {remaining} of {MESSAGE_LIMIT} messages remaining for this pending
            contact.
          </p>
        )}
      </div>

      {showProfile && (
        <CustomerProfilePopup
          customer={customer}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
