"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { AgentOrb } from "../../components/app/utils";
import { useShops, useShopDetail } from "../../../hooks/useShops";
import { ShopCard, ShopChatView } from "../../components/shops";
import { SHOP_CATEGORIES, type ShopListItem } from "../../../types";

function UserShoppingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopIdFromUrl = searchParams.get("shop");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedShop, setSelectedShop] = useState<ShopListItem | null>(null);

  const {
    shops,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreShops,
  } = useShops({
    search: searchQuery,
    category: selectedCategory,
  });

  const { data: detailData, isLoading: isDetailLoading } = useShopDetail(
    !selectedShop && shopIdFromUrl ? shopIdFromUrl : undefined
  );

  useEffect(() => {
    if (shopIdFromUrl && !selectedShop) {
      const match = shops.find((s) => s.id === shopIdFromUrl);
      if (match) {
        setSelectedShop(match);
      } else if (detailData) {
        setSelectedShop({
          id: detailData.id,
          business_name: detailData.business_name,
          business_type: detailData.business_type,
          description: detailData.description || "",
          popular_products: [],
          city: detailData.address?.city || "",
          area: detailData.address?.line2 || "",
          address: detailData.address ? {
            line1: detailData.address.line1,
            city: detailData.address.city,
            pincode: detailData.address.pincode,
          } : undefined,
          is_active: detailData.is_active,
        });
      }
    } else if (!shopIdFromUrl && selectedShop) {
      setSelectedShop(null);
    }
  }, [shopIdFromUrl, shops, detailData, selectedShop]);

  const handleSelectShop = (shop: ShopListItem) => {
    setSelectedShop(shop);
    router.push(`/user?shop=${shop.id}`, { scroll: false });
  };

  const handleBack = () => {
    setSelectedShop(null);
    router.push("/user", { scroll: false });
  };

  if (selectedShop) {
    return (
      <ShopChatView
        shop={selectedShop}
        onBack={handleBack}
      />
    );
  }

  if (shopIdFromUrl && isDetailLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full font-intert">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent mb-3" />
        <p className="text-xs text-muted">Opening store assistant...</p>
      </div>
    );
  }

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
            Browse verified local stores, check real-time availability, and order with AI assistance.
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by store name, location, or product..."
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
              Try searching with another keyword or selecting a different category.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onSelect={handleSelectShop}
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
      </div>
    </div>
  );
}

export default function UserShoppingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <UserShoppingContent />
    </Suspense>
  );
}
