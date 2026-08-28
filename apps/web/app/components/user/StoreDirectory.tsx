"use client";

import { useMemo } from "react";
import {
  Search,
  Store,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { AgentOrb } from "../app/utils";
import { StoreItem, STORES, CATEGORIES } from "./types";

interface StoreDirectoryProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectStore: (store: StoreItem) => void;
}

export function StoreDirectory({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onSelectStore,
}: StoreDirectoryProps) {
  const filteredStores = useMemo(() => {
    return STORES.filter((store) => {
      const matchesCategory =
        selectedCategory === "All" || store.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        store.name.toLowerCase().includes(query) ||
        store.location.toLowerCase().includes(query) ||
        store.area.toLowerCase().includes(query) ||
        store.category.toLowerCase().includes(query) ||
        store.popularItems.some((item) => item.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
              <AgentOrb size={12} className="text-brand not-italic" />
              <span>AI Commerce Directory</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
            Find Stores & Shop via AI
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Select a nearby Kirana store or pharmacy to check stock, chat with
            their store AI, and place instant orders.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by store name, location (e.g. Andheri, Bandra), or product..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="p-5 rounded-2xl border border-border bg-surface hover:border-brand/40 transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-semibold text-sm shrink-0">
                      <Store size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-primary group-hover:text-brand transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-[11px] text-muted font-medium">
                        {store.category}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium border border-emerald-500/20 shrink-0">
                    <ShieldCheck size={11} />
                    <span>Verified</span>
                  </span>
                </div>

                <p className="text-xs text-muted flex items-center gap-1.5 mb-3">
                  <MapPin size={13} className="shrink-0 text-muted" />
                  <span className="truncate">{store.location}</span>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {store.popularItems.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded-lg bg-bg border border-border text-[10px] text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <MapPin size={11} className="text-muted" />
                  <span>{store.area}</span>
                </span>

                <button
                  type="button"
                  onClick={() => onSelectStore(store)}
                  className="px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <AgentOrb size={13} className="text-white not-italic" />
                  <span>Chat & Order</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface">
            <ShoppingBag size={28} className="mx-auto text-muted mb-2" />
            <p className="text-sm font-medium text-primary">No stores found</p>
            <p className="text-xs text-muted mt-0.5">
              Try searching for another area, store name, or product category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
