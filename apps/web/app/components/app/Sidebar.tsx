"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BarChart3,
  ClipboardList,
  Package,
  Users,
  Banknote,
  SlidersHorizontal,
  Plus,
  ChevronsLeft,
  Menu,
  X,
} from "lucide-react";
import { AgentOrb } from "./utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Bot;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/chat", label: "Chat", icon: Bot },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/payouts", label: "Payouts", icon: Banknote },
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface border-r border-border md:relative md:z-auto transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] w-64 md:translate-x-0 ${
          collapsed ? "md:w-[68px]" : "md:w-60"
        } ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="flex items-center h-14 shrink-0 px-3.5 justify-between border-b border-border">
          <div
            className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${
              collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            }`}
          >
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-primary font-instrument italic text-xl tracking-tight"
            >
              <AgentOrb size={18} className="not-italic text-brand shrink-0" />
              <span>MerchantAgent</span>
            </Link>
          </div>

          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="hidden md:flex items-center justify-center mx-auto text-brand hover:opacity-80 transition-opacity cursor-pointer"
              title="Expand Sidebar"
            >
              <AgentOrb size={20} />
            </button>
          )}

          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors ${
              collapsed ? "hidden" : ""
            }`}
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X size={18} />
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
                ? "md:w-10 md:h-10 md:justify-center md:mx-auto w-full px-3 py-2.5 gap-2"
                : "w-full px-3 py-2.5 gap-2"
            }`}
          >
            <Plus size={16} strokeWidth={2.5} className="shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed
                  ? "md:w-0 md:opacity-0 md:hidden"
                  : "w-auto opacity-100"
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
                    ? "md:w-10 md:h-10 md:justify-center md:mx-auto w-full px-3 py-2 gap-2.5"
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
                    collapsed
                      ? "md:w-0 md:opacity-0 md:hidden"
                      : "w-auto opacity-100"
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
              ? "md:opacity-0 md:pointer-events-none md:max-h-0 opacity-100 mt-3"
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
                    className="block px-2.5 py-1.5 rounded-lg text-xs font-intert text-secondary hover:text-primary hover:bg-surface-muted transition-colors truncate"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 border-t border-border mt-auto shrink-0">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-surface-muted hover:bg-border/40 transition-all duration-300 ${
              collapsed ? "md:justify-center md:p-1.5" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-medium font-intert text-xs shrink-0">
              ST
            </div>
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed
                  ? "md:w-0 md:opacity-0 md:hidden"
                  : "w-auto opacity-100 flex-1 min-w-0"
              }`}
            >
              <p className="text-xs font-medium font-intert text-primary truncate">
                Sharma Store
              </p>
              <p className="text-[11px] text-muted font-intert truncate">
                sharma@kirana.in
              </p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-surface md:hidden">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors"
          >
            <Menu size={18} />
          </button>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-primary font-instrument italic text-lg tracking-tight"
          >
            <AgentOrb size={16} className="not-italic text-brand" />
            <span>MerchantAgent</span>
          </Link>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-hidden flex flex-col min-h-0 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
