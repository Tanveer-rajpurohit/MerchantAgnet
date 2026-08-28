"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import type { Order, OrderStatus } from "../../types/order";
import { SearchInput } from "../../components/app/utils";
import {
  OrderList,
  OrderModal,
  WhatsAppAIModal,
  ORDERS as INITIAL_ORDERS,
  AVAILABLE_CUSTOMERS,
} from "../../components/app/orders";

type OrderTab = "all" | OrderStatus;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<OrderTab>("all");

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTargetOrder, setWhatsAppTargetOrder] = useState<Order | null>(
    null,
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = tab === "all" ? true : o.status === tab;
      const matchesSearch =
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some((it) =>
          it.name.toLowerCase().includes(search.toLowerCase()),
        );
      return matchesTab && matchesSearch;
    });
  }, [orders, search, tab]);

  const totalOutstanding = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0);

  const paidTotal = orders
    .filter((o) => o.status === "Paid")
    .reduce((sum, o) => sum + o.paidAmount, 0);

  const unpaidCount = orders.filter((o) => o.status === "Unpaid").length;

  const STATS = [
    {
      label: "Total Outstanding",
      value: `₹${totalOutstanding.toLocaleString("en-IN")}`,
    },
    { label: "Collected", value: `₹${paidTotal.toLocaleString("en-IN")}` },
    { label: "Unpaid Orders", value: String(unpaidCount) },
    { label: "Total Orders", value: String(orders.length) },
  ];

  const TABS: { id: OrderTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "Unpaid", label: "Unpaid" },
    { id: "Paid", label: "Paid" },
    { id: "Cancelled", label: "Cancelled" },
  ];

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (
    orderData: Omit<Order, "id" | "date"> & { id?: string },
  ) => {
    if (orderData.id) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderData.id
            ? {
                ...o,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                paidAmount: orderData.paidAmount,
                status: orderData.status,
              }
            : o,
        ),
      );
    } else {
      const newOrder: Order = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paidAmount: 0,
        status: "Unpaid",
        date: new Date().toISOString().slice(0, 10),
      };
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  const handleWhatsAppClick = (order: Order) => {
    setWhatsAppTargetOrder(order);
    setIsWhatsAppModalOpen(true);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o)),
    );
  };

  const handleMarkPaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, paidAmount: o.totalAmount, status: "Paid" }
          : o,
      ),
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto font-intert">
      <div className="px-4 sm:px-10 lg:px-16 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-instrument text-primary tracking-tight">
              Orders
            </h1>
            <p className="text-sm text-muted font-intert mt-1">
              Track customer purchases, edit items, generate instant payment
              links, and send bills directly over WhatsApp.
            </p>
          </div>
          <button
            onClick={handleOpenNewOrder}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            New Order
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-xs text-muted uppercase tracking-wide mb-1.5">
                {stat.label}
              </p>
              <p className="text-2xl font-instrument text-primary">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                  tab === t.id
                    ? "border-brand text-primary"
                    : "border-transparent text-muted hover:text-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by customer name or product..."
            className="w-full sm:w-96"
          />
        </div>

        <OrderList
          orders={filtered}
          onEditOrder={handleOpenEditOrder}
          onWhatsAppClick={handleWhatsAppClick}
          onCancelOrder={handleCancelOrder}
          onMarkPaid={handleMarkPaid}
        />
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        customers={AVAILABLE_CUSTOMERS}
      />

      <WhatsAppAIModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        order={whatsAppTargetOrder}
      />
    </div>
  );
}
