"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BarChart3,
  Package,
  CreditCard,
  Wallet,
  ScrollText,
  SlidersHorizontal,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Sparkles;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/chat", label: "Chat", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/payment-links", label: "Payment Links", icon: CreditCard },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
];

const MOCK_HISTORY = [
  { id: "1", title: "Send Rahul a payment link", date: "Today" },
  { id: "2", title: "Diwali offer for 20 customers", date: "Today" },
  { id: "3", title: "Update milk stock count", date: "Yesterday" },
  { id: "4", title: "Check last week revenue", date: "Yesterday" },
];

function groupByDate(
  items: typeof MOCK_HISTORY,
): Record<string, typeof MOCK_HISTORY> {
  const grouped: Record<string, typeof MOCK_HISTORY> = {};
  for (const item of items) {
    if (!grouped[item.date]) {
      grouped[item.date] = [];
    }
    grouped[item.date]!.push(item);
  }
  return grouped;
}

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const grouped = groupByDate(MOCK_HISTORY);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close mobile menu"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border md:relative md:z-auto transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed ? "w-[68px]" : "w-60"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center h-14 shrink-0 px-3.5 justify-between border-b border-border">
          <div
            className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <Link
              href="/chat"
              className="text-primary font-instrument italic text-xl tracking-tight"
            >
              MerchantAgent
            </Link>
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <ChevronsLeft size={16} />
            )}
          </button>
        </div>

        <div className="p-2.5">
          <Link
            href="/chat"
            onClick={() => {
              setMobileOpen(false);
              window.dispatchEvent(new CustomEvent("mag:new-chat"));
            }}
            className={`flex items-center btn-brand-solid rounded-xl text-sm font-medium font-intert transition-all duration-300 ${
              collapsed
                ? "w-10 h-10 justify-center mx-auto"
                : "w-full px-3 py-2.5 gap-2"
            }`}
          >
            <Plus size={16} strokeWidth={2.5} className="shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
              }`}
            >
              New Chat
            </span>
          </Link>
        </div>

        <nav className="px-2.5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/chat" && pathname.startsWith("/chat"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-[13px] font-medium font-intert transition-all duration-200 ${
                  collapsed
                    ? "w-10 h-10 justify-center mx-auto"
                    : "w-full px-3 py-2 gap-2.5"
                } ${
                  isActive
                    ? "bg-surface-muted text-primary font-semibold"
                    : "text-secondary hover:text-primary hover:bg-surface-muted"
                }`}
              >
                <item.icon size={16} strokeWidth={1.8} className="shrink-0" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={`flex-1 px-2.5 overflow-y-auto hide-scrollbar transition-all duration-300 ${
            collapsed
              ? "opacity-0 pointer-events-none max-h-0"
              : "opacity-100 mt-3"
          }`}
        >
          <div className="border-t border-border pt-3">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="mb-3">
                <p className="px-2.5 mb-1 text-[11px] font-medium font-intert text-muted uppercase tracking-wider">
                  {date}
                </p>
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/chat/${item.id}`}
                    onClick={() => setMobileOpen(false)}
                    className={`block truncate rounded-lg px-2.5 py-1.5 text-[13px] font-intert transition-colors ${
                      pathname === `/chat/${item.id}`
                        ? "bg-surface-muted text-primary font-medium"
                        : "text-secondary hover:text-primary hover:bg-surface-muted"
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {collapsed && <div className="flex-1" />}

        <div className="mt-auto border-t border-border p-3 shrink-0">
          <Link
            href="/settings"
            title="Sharma Store (Settings)"
            className={`flex items-center rounded-xl hover:bg-surface-muted transition-all group ${
              collapsed ? "justify-center p-0.5" : "px-2 py-1.5 gap-2.5"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-brand/15 flex items-center justify-center text-brand text-xs font-semibold font-intert shrink-0 group-hover:ring-2 group-hover:ring-brand/30 transition-all">
              S
            </div>
            <div
              className={`flex-1 min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
              }`}
            >
              <p className="text-sm font-medium text-primary truncate font-intert">
                Sharma Store
              </p>
              <p className="text-[11px] text-muted truncate font-intert">
                Kirana / Grocery
              </p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-14 px-4 border-b border-border shrink-0 md:hidden">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-secondary hover:text-primary hover:bg-surface-muted transition-colors"
          >
            <Menu size={18} />
          </button>
          <span className="ml-3 text-primary font-instrument italic text-lg">
            MerchantAgent
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
