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
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    icon: Link2,
    title: "Generate Payment Link",
    subtitle: "Create a link in seconds",
    href: "/chat",
  },
  {
    icon: Megaphone,
    title: "Draft a Campaign",
    subtitle: "Offer, gated for your approval",
    href: "/chat",
  },
  {
    icon: Package,
    title: "Check Low Stock",
    subtitle: "See what needs restocking",
    href: "/products",
  },
  {
    icon: TrendingUp,
    title: "Revenue Summary",
    subtitle: "This week vs last week",
    href: "/payouts",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {QUICK_ACTIONS.map((action) => (
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
      ))}
    </div>
  );
}
