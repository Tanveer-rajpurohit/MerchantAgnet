"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  ShoppingBag,
  SlidersHorizontal,
  ChevronsLeft,
  Menu,
  X,
} from "lucide-react";
import { AgentOrb } from "../app/utils";
import { useAuth } from "../../../context/AuthContext";

interface UserNavItem {
  href: string;
  label: string;
  icon: typeof Store;
}

const USER_NAV_ITEMS: UserNavItem[] = [
  { href: "/user", label: "Shop via AI", icon: Store },
  { href: "/user/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/user/settings", label: "Settings", icon: SlidersHorizontal },
];

const RECENT_STORES = [
  {
    id: "sharma-store",
    name: "Sharma Kirana Store",
    category: "Kirana / Grocery",
  },
  {
    id: "gupta-provisions",
    name: "Gupta Daily Provisions",
    category: "Dairy & Staples",
  },
  { id: "patel-meds", name: "Patel Medical Store", category: "Pharmacy" },
];

interface UserSidebarProps {
  children?: React.ReactNode;
}

export function UserSidebar({ children }: UserSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const displayName = user?.full_name || "Customer";
  const displayContact = user?.email || user?.phone_number || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen bg-bg overflow-hidden font-intert">
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
              href="/user"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-primary font-instrument italic text-xl tracking-tight"
            >
              <AgentOrb size={18} className="not-italic text-brand shrink-0" />
              <span>Buyer Copilot</span>
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

        <nav className="p-2.5 space-y-1">
          {USER_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 ${
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
              ? "md:opacity-0 md:pointer-events-none md:max-h-0 opacity-100 mt-2"
              : "opacity-100 mt-2"
          }`}
        >
          <div className="border-t border-border pt-3">
            <p className="px-2.5 mb-1.5 text-[11px] font-medium text-muted uppercase tracking-wider">
              Favorite Stores
            </p>
            {RECENT_STORES.map((store) => (
              <Link
                key={store.id}
                href={`/user?store=${store.id}`}
                onClick={() => setMobileOpen(false)}
                className="block px-2.5 py-1.5 rounded-lg text-xs text-secondary hover:text-primary hover:bg-surface-muted transition-colors truncate"
              >
                <p className="font-medium truncate">{store.name}</p>
                <p className="text-[10px] text-muted truncate">
                  {store.category}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-2.5 border-t border-border mt-auto shrink-0">
          <Link
            href="/user/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-surface-muted hover:bg-border/40 transition-all duration-300 ${
              collapsed ? "md:justify-center md:p-1.5" : ""
            }`}
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-medium text-xs shrink-0 overflow-hidden">
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                collapsed
                  ? "md:w-0 md:opacity-0 md:hidden"
                  : "w-auto opacity-100 flex-1 min-w-0"
              }`}
            >
              <p className="text-xs font-medium text-primary truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-muted truncate">{displayContact}</p>
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
            href="/user"
            className="flex items-center gap-1.5 text-primary font-instrument italic text-lg tracking-tight"
          >
            <AgentOrb size={16} className="not-italic text-brand" />
            <span>Buyer Copilot</span>
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
