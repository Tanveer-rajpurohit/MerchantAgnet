"use client";

import { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  Sparkles,
  Link2,
  Package,
  Megaphone,
  X,
} from "lucide-react";

export type ActionMode = "default" | "payment-link" | "catalog" | "campaign";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string, mode: ActionMode) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask anything about payment links, stock, or campaigns...",
  autoFocus = false,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeMode, setActiveMode] = useState<ActionMode>("default");
  const [deepReasoning, setDeepReasoning] = useState(false);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleInput = (val: string) => {
    onChange(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 160);
      textareaRef.current.style.height = `${Math.max(nextHeight, 24)}px`;
    }
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value, activeMode);
    onChange("");
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

  const modeBadge = () => {
    if (activeMode === "payment-link") {
      return {
        label: "Payment Link Mode",
        icon: Link2,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    if (activeMode === "catalog") {
      return {
        label: "Stock & Catalog Mode",
        icon: Package,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    if (activeMode === "campaign") {
      return {
        label: "Campaign Offer Mode",
        icon: Megaphone,
        color: "bg-brand/15 text-brand border-brand/30",
      };
    }
    return null;
  };

  const badge = modeBadge();

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-surface shadow-xs transition-all focus-within:border-brand/50 focus-within:bg-surface">
        {badge && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-intert ${badge.color}`}
            >
              <badge.icon size={12} />
              <span>{badge.label}</span>
              <button
                type="button"
                onClick={() => setActiveMode("default")}
                className="ml-1 hover:opacity-75"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] text-primary font-intert outline-none placeholder:text-muted/60 leading-relaxed disabled:opacity-50 max-h-[160px] overflow-y-auto"
            style={{ minHeight: "24px" }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-border-subtle/60">
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Attach product catalog or invoice"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-secondary hover:bg-surface-muted transition-colors"
            >
              <Paperclip size={15} />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(
                  activeMode === "payment-link" ? "default" : "payment-link",
                )
              }
              title="Create Payment Link"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "payment-link"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Link2 size={13} />
              <span className="hidden sm:inline">Pay Link</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(activeMode === "catalog" ? "default" : "catalog")
              }
              title="Check Inventory & Catalog"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "catalog"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Package size={13} />
              <span className="hidden sm:inline">Catalog</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveMode(
                  activeMode === "campaign" ? "default" : "campaign",
                )
              }
              title="Draft Discount Campaign"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                activeMode === "campaign"
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Megaphone size={13} />
              <span className="hidden sm:inline">Campaign</span>
            </button>

            <button
              type="button"
              onClick={() => setDeepReasoning(!deepReasoning)}
              title="Toggle Merchant Agent Deep Reasoning"
              className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium font-intert transition-colors ${
                deepReasoning
                  ? "bg-brand/15 text-brand"
                  : "text-muted hover:text-secondary hover:bg-surface-muted"
              }`}
            >
              <Sparkles size={13} />
              <span className="hidden md:inline">Agent Copilot</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="flex items-center justify-center w-8 h-8 rounded-lg btn-brand-solid disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
