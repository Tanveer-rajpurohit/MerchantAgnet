"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "../../../hooks";
import {
  ProductTable,
  ProductMobileList,
  AddProductModal,
  EditProductModal,
} from "../../components/app/products";
import {
  ExpenseTable,
  ExpenseMobileList,
  AddExpenseModal,
  EditExpenseModal,
} from "../../components/app/expenses";
import type { ProductResponse } from "../../../types/product";
import type { ExpenseResponse } from "../../../types/expense";

type InventoryTab = "products" | "expenses";

export default function ProductsAndExpensesPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("products");
  const [productSearch, setProductSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseResponse | null>(null);

  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const { data: expenses = [], isLoading: isExpensesLoading } = useExpenses();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.product_name.toLowerCase().includes(productSearch.toLowerCase()),
    );
  }, [products, productSearch]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) =>
      e.category.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(expenseSearch.toLowerCase())),
    );
  }, [expenses, expenseSearch]);

  const totalExpenseSum = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [expenses]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => p.low_stock_alert && p.current_stock <= p.low_stock_alert,
    ).length;
  }, [products]);

  const tabs: { id: InventoryTab; label: string; count: number }[] = [
    { id: "products", label: "Products Catalog", count: products.length },
    { id: "expenses", label: "Operating Expenses", count: expenses.length },
  ];

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Catalog & Operating Expenses
            </h1>
            <p className="text-sm text-muted font-intert mt-1">
              Manage inventory items for AI commerce and track fixed & variable overhead costs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "products" ? (
              <>
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-brand-solid text-xs sm:text-sm font-medium shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Product</span>
                </button>
              </>
            ) : (
              <>
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    placeholder="Search expenses..."
                    className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:border-brand/50 shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-brand-solid text-xs sm:text-sm font-medium shadow-xs shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Expense</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
              Total Catalog Items
            </p>
            <p className="text-2xl font-instrument text-primary">{products.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
              Low Stock Alerts
            </p>
            <p className={`text-2xl font-instrument ${lowStockCount > 0 ? "text-warning" : "text-primary"}`}>
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
              Logged Expenses
            </p>
            <p className="text-2xl font-instrument text-primary">{expenses.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
              Monthly Overhead
            </p>
            <p className="text-2xl font-instrument text-primary">
              ₹{totalExpenseSum.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-medium font-intert border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-brand text-primary font-semibold"
                  : "border-transparent text-muted hover:text-secondary"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-surface-muted text-muted font-normal">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "products" ? (
          isProductsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : (
            <>
              <ProductMobileList
                products={filteredProducts}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={(id) => deleteProductMutation.mutate(id)}
              />
              <ProductTable
                products={filteredProducts}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={(id) => deleteProductMutation.mutate(id)}
              />
            </>
          )
        ) : isExpensesLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : (
          <>
            <ExpenseMobileList
              expenses={filteredExpenses}
              onEdit={(e) => setEditingExpense(e)}
              onDelete={(id) => deleteExpenseMutation.mutate(id)}
            />
            <ExpenseTable
              expenses={filteredExpenses}
              onEdit={(e) => setEditingExpense(e)}
              onDelete={(id) => deleteExpenseMutation.mutate(id)}
            />
          </>
        )}
      </div>

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAdd={(payload) => createProductMutation.mutateAsync(payload)}
        isPending={createProductMutation.isPending}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onUpdate={(id, payload) => updateProductMutation.mutateAsync({ id, payload })}
        isPending={updateProductMutation.isPending}
      />

      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onAdd={(payload) => createExpenseMutation.mutateAsync(payload)}
        isPending={createExpenseMutation.isPending}
      />

      <EditExpenseModal
        expense={editingExpense}
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        onUpdate={(id, payload) => updateExpenseMutation.mutateAsync({ id, payload })}
        isPending={updateExpenseMutation.isPending}
      />
    </div>
  );
}
