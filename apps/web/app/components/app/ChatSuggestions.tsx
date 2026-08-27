"use client";

import { Link2, Package, Megaphone, TrendingUp } from "lucide-react";

interface SuggestionItem {
  id: string;
  icon: typeof Link2;
  title: string;
  subtitle: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "1",
    icon: Link2,
    title: "Generate Razorpay Link",
    subtitle: "Create a ₹500 payment link for Rahul's grocery order",
    prompt:
      "Generate a ₹500 Razorpay payment link for customer Rahul for grocery order",
  },
  {
    id: "2",
    icon: Package,
    title: "Check Low Stock Items",
    subtitle: "List products approaching replenishment threshold",
    prompt:
      "Show me all products in inventory that are below low stock alert limit",
  },
  {
    id: "3",
    icon: Megaphone,
    title: "Draft Festival Campaign",
    subtitle: "Draft 10% discount offer for top 20 loyal buyers",
    prompt:
      "Draft a 10% Diwali discount campaign for my top 20 repeat customers and show the approval batch",
  },
  {
    id: "4",
    icon: TrendingUp,
    title: "Weekly Revenue Summary",
    subtitle: "Review settled links and growth trends",
    prompt:
      "Summarize this week's settled payment links and revenue performance",
  },
];

interface ChatSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {SUGGESTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.prompt)}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-muted/70 text-left transition-all group"
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
