"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { ProductRow } from "../../types/onboarding";
import {
  ProductTable,
  ProductMobileList,
  AddProductModal,
  type ProductFormData,
} from "../../components/app/products";

const generateId = () => Math.random().toString(36).slice(2, 9);

const INITIAL_PRODUCTS: ProductRow[] = [
  {
    id: generateId(),
    name: "Maggi 12-pack",
    costPrice: "120",
    sellingPrice: "145",
    currentStock: "48",
    lowStockAlert: "10",
  },
  {
    id: generateId(),
    name: "Amul Milk 1L",
    costPrice: "58",
    sellingPrice: "62",
    currentStock: "30",
    lowStockAlert: "15",
  },
  {
    id: generateId(),
    name: "Tata Salt 1kg",
    costPrice: "22",
    sellingPrice: "28",
    currentStock: "60",
    lowStockAlert: "20",
  },
  {
    id: generateId(),
    name: "Parle-G Biscuit",
    costPrice: "8",
    sellingPrice: "10",
    currentStock: "12",
    lowStockAlert: "15",
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddProduct = (data: ProductFormData) => {
    setProducts((prev) => [...prev, { id: generateId(), ...data }]);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChange = (id: string, field: keyof ProductRow, value: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Products
            </h1>
            <p className="text-sm text-muted font-intert mt-1">
              Your catalog - this is what the agent reads from when it creates
              payment links and answers stock questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full sm:w-48 pl-8 pr-3 py-2.5 sm:py-2 text-sm rounded-lg border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        <ProductMobileList
          products={filtered}
          handleDelete={handleDelete}
          handleChange={handleChange}
        />

        <ProductTable
          products={filtered}
          handleChange={handleChange}
          handleDelete={handleDelete}
        />
      </div>

      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
