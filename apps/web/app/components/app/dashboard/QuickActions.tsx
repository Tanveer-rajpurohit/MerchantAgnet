"use client";

import Link from "next/link";
import {
  Link2,
  Package,
  Megaphone,
  TrendingUp,
  ArrowRight,
  LucideIcon,
} from "lucide-react";

interface QuickActionItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: string;
  isModal?: boolean;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    icon: Link2,
    title: "Generate Payment Link",
    subtitle: "Create link via AI or manual form",
    href: "/chat?mode=payment-link",
    isModal: true,
  },
  {
    icon: Megaphone,
    title: "Draft a Campaign",
    subtitle: "Festive discount offer, approval gated",
    href: "/chat?mode=campaign",
  },
  {
    icon: Package,
    title: "Check Low Stock",
    subtitle: "AI inventory scan & restock alerts",
    href: "/chat?mode=catalog",
  },
  {
    icon: TrendingUp,
    title: "Revenue Summary",
    subtitle: "AI weekly collection breakdown & metrics",
    href: "/chat?mode=revenue",
  },
];

interface QuickActionsProps {
  onGeneratePaymentLink?: () => void;
}

export function QuickActions({ onGeneratePaymentLink }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 font-intert">
      {QUICK_ACTIONS.map((action) => {
        if (action.isModal && onGeneratePaymentLink) {
          return (
            <button
              key={action.title}
              type="button"
              onClick={onGeneratePaymentLink}
              className="flex items-center gap-3.5 rounded-xl border border-border bg-surface p-4 hover:border-brand/40 hover:bg-surface-muted/60 transition-colors group text-left cursor-pointer w-full"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
                <action.icon
                  size={16}
                  className="text-secondary group-hover:text-brand transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">
                  {action.title}
                </p>
                <p className="text-xs text-muted truncate">{action.subtitle}</p>
              </div>
              <ArrowRight
                size={14}
                className="text-muted group-hover:text-brand transition-colors shrink-0"
              />
            </button>
          );
        }

        return (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center gap-3.5 rounded-xl border border-border bg-surface p-4 hover:border-brand/40 hover:bg-surface-muted/60 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
              <action.icon
                size={16}
                className="text-secondary group-hover:text-brand transition-colors"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{action.title}</p>
              <p className="text-xs text-muted truncate">{action.subtitle}</p>
            </div>
            <ArrowRight
              size={14}
              className="text-muted group-hover:text-brand transition-colors shrink-0"
            />
          </Link>
        );
      })}
    </div>
  );
}
