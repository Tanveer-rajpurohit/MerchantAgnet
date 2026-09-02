"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { AgentOrb } from "../components/app/utils";
import { useAuth } from "../../context/AuthContext";
import { useShops } from "../../hooks/useShops";
import { TrafficRateLimitCard, ShopCard, ShopChatView } from "../components/shops";
import { SHOP_CATEGORIES, type ShopListItem } from "../../types";

export default function PublicShopsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShop, setSelectedShop] = useState<ShopListItem | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user?.role === "customer") {
      router.replace("/user");
    }
  }, [isAuthenticated, isAuthLoading, user?.role, router]);

  const {
    shops,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreShops,
    error,
    refetch,
  } = useShops({
    search: searchQuery,
    category: selectedCategory,
  });

  const isRateLimited = (error as { status?: number } | null)?.status === 429;

  if (selectedShop) {
    return (
      <div className="w-full h-screen flex flex-col bg-bg font-intert">
        <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-surface shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-instrument italic text-xl tracking-tight"
          >
            <AgentOrb size={20} className="not-italic text-brand shrink-0" />
            <span>MerchantAgent</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <ThemeToggle inline className="!h-8 !w-8 !rounded-xl shrink-0" />
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?redirect=/shops"
                  className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-primary transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register?redirect=/shops"
                  className="px-3.5 py-1.5 rounded-xl btn-brand-solid text-xs font-medium shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <span className="text-xs text-muted font-medium">
                {user?.full_name || "Customer"}
              </span>
            )}
          </div>
        </header>

        <ShopChatView
          shop={selectedShop}
          onBack={() => setSelectedShop(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-intert flex flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-surface/80 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary font-instrument italic text-xl tracking-tight"
        >
          <AgentOrb size={20} className="not-italic text-brand shrink-0" />
          <span>MerchantAgent</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle inline className="!h-8 !w-8 !rounded-xl shrink-0" />
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login?redirect=/shops"
                className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register?redirect=/shops"
                className="px-3.5 py-1.5 rounded-xl btn-brand-solid text-xs font-medium shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <Link
              href="/user"
              className="px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-primary transition-colors flex items-center gap-1.5"
            >
              <span>Go to Portal</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
              <AgentOrb size={12} className="text-brand not-italic" />
              <span>Public Store Directory</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-instrument text-primary tracking-tight">
            Find Nearby Stores & Order via AI
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-xl">
            Browse local merchants, check real-time product catalogs, and chat with
            store copilots to place instant orders.
          </p>
        </div>

        {isRateLimited && (
          <TrafficRateLimitCard onRetry={() => refetch()} />
        )}

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name, location, or products..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {SHOP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "border-brand bg-brand/10 text-primary font-semibold"
                    : "border-border bg-surface text-secondary hover:text-primary hover:bg-surface-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface">
            <ShoppingBag size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-medium text-primary">No stores found</p>
            <p className="text-xs text-muted mt-0.5">
              Try searching with different terms or selecting another category.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onSelect={(s) => setSelectedShop(s)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={loadMoreShops}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-xs font-medium text-primary transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingMore && (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  )}
                  <span>{isLoadingMore ? "Loading more..." : "Load More Stores"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
