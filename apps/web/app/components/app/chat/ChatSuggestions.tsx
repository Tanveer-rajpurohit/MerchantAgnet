"use client";

import { Link2, Package, Megaphone, TrendingUp } from "lucide-react";
import type { ActionMode, SuggestionItem } from "../../../../types";

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "1",
    icon: Link2,
    title: "Generate Payment Link",
    subtitle: "Create a ₹500 payment link for Rahul's grocery order",
    prompt: "Generate a ₹500 payment link for customer Rahul",
    mode: "payment-link",
  },
  {
    id: "2",
    icon: Package,
    title: "Check Low Stock Items",
    subtitle: "List products approaching replenishment threshold",
    prompt:
      "Show me all products in inventory that are below low stock alert limit",
    mode: "catalog",
  },
  {
    id: "3",
    icon: Megaphone,
    title: "Draft Festival Campaign",
    subtitle: "Draft 10% discount offer for top 20 loyal buyers",
    prompt:
      "Draft a 10% Diwali discount campaign for my top 20 repeat customers and show the approval batch",
    mode: "campaign",
  },
  {
    id: "4",
    icon: TrendingUp,
    title: "Weekly Revenue Summary",
    subtitle: "Review weekly collections, growth trends and insights",
    prompt: "Show weekly revenue summary and store performance",
    mode: "default",
  },
];

interface ChatSuggestionsProps {
  onSelect: (prompt: string, mode?: ActionMode) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full font-intert">
      {SUGGESTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt, item.mode)}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/70 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-muted group-hover:bg-brand/15 text-muted group-hover:text-brand flex items-center justify-center shrink-0 transition-colors">
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-primary font-intert truncate">
                {item.title}
              </p>
              <p className="text-xs text-muted font-intert line-clamp-1 mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
