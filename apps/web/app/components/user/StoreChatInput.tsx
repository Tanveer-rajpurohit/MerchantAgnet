"use client";

import { useRef } from "react";
import { Send } from "lucide-react";

interface StoreChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text?: string) => void;
  storeName: string;
  disabled?: boolean;
}

export function StoreChatInput({
  value,
  onChange,
  onSend,
  storeName,
  disabled = false,
}: StoreChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (val: string) => {
    onChange(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${Math.max(nextHeight, 24)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (textToSend?: string) => {
    onSend(textToSend);
    if (!textToSend && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="shrink-0 border-t border-border px-4 sm:px-8 py-4 bg-bg font-intert">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSend("Order 5kg Aashirvaad Atta & 2L Milk")}
            className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            🌾 5kg Atta + 2L Milk
          </button>
          <button
            type="button"
            onClick={() => handleSend("Check Maggi 12-pack price")}
            className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            🍜 Maggi Price
          </button>
          <button
            type="button"
            onClick={() => handleSend("Do you have Fortune Oil and Tata Salt?")}
            className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            🧂 Oil & Salt
          </button>
        </div>

        <div className="relative flex items-end rounded-2xl border border-border bg-surface shadow-xs focus-within:border-brand/50 p-1.5 pl-3.5 transition-all">
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${storeName} AI (e.g. 5kg Atta, 2L Milk, Bread)...`}
            rows={1}
            className="w-full resize-none bg-transparent text-xs sm:text-sm text-primary placeholder:text-muted focus:outline-none max-h-[140px] overflow-y-auto py-1.5 pr-2 leading-relaxed disabled:opacity-50"
            style={{ minHeight: "24px" }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!value.trim() || disabled}
            aria-label="Send query"
            className="shrink-0 p-2 rounded-xl btn-brand-solid text-white transition-opacity disabled:opacity-30 cursor-pointer mb-0.5"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
