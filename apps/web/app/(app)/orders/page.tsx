"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
} from "../../../hooks/useOrders";
import type {
  OrderResponse,
  OrderStatus,
  OrderCreatePayload,
} from "../../../types";
import { SearchInput } from "../../components/app/utils";
import {
  OrderList,
  OrderModal,
  WhatsAppAIModal,
} from "../../components/app/orders";

type OrderTab = "all" | OrderStatus;

const TABS: { id: OrderTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
  { id: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<OrderTab>("all");

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTargetOrder, setWhatsAppTargetOrder] =
    useState<OrderResponse | null>(null);

  const {
    orders,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreOrders,
  } = useOrders({
    status: tab === "all" ? undefined : tab,
    search,
  });

  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();

  const totalOutstanding = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce(
        (sum, o) =>
          sum + (Number(o.total_amount) || 0) - (Number(o.paid_amount) || 0),
        0,
      );
  }, [orders]);

  const paidTotal = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.paid_amount) || 0), 0);
  }, [orders]);

  const unpaidCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === "unpaid" || o.status === "partially_paid",
    ).length;
  }, [orders]);

  const STATS = [
    {
      label: "Total Outstanding",
      value: `₹${totalOutstanding.toLocaleString("en-IN")}`,
    },
    { label: "Collected", value: `₹${paidTotal.toLocaleString("en-IN")}` },
    { label: "Unpaid Orders", value: String(unpaidCount) },
    { label: "Total Orders", value: String(orders.length) },
  ];

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: OrderResponse) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleWhatsAppClick = (order: OrderResponse) => {
    setWhatsAppTargetOrder(order);
    setIsWhatsAppModalOpen(true);
  };

  const handleSaveOrder = async (orderData: OrderCreatePayload) => {
    if (editingOrder) {
      await updateOrderMutation.mutateAsync({
        orderId: editingOrder.id,
        payload: {
          status: orderData.status,
          paid_amount: orderData.paid_amount,
        },
      });
    } else {
      await createOrderMutation.mutateAsync(orderData);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    await updateOrderMutation.mutateAsync({
      orderId,
      payload: { status: "cancelled", reason: "Cancelled by merchant" },
    });
  };

  const handleMarkPaid = async (orderId: string, totalAmount: number) => {
    await updateOrderMutation.mutateAsync({
      orderId,
      payload: { status: "paid", paid_amount: totalAmount },
    });
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
              Track customer purchases, edit order items, and manage payment settlements.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNewOrder}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl btn-brand-solid text-xs sm:text-sm font-medium shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Order</span>
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
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${
                  tab === t.id
                    ? "border-brand text-primary font-semibold"
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
          orders={orders}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreOrders}
          onEditOrder={handleOpenEditOrder}
          onCancelOrder={handleCancelOrder}
          onMarkPaid={handleMarkPaid}
          onWhatsAppClick={handleWhatsAppClick}
        />
      </div>

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        isPending={createOrderMutation.isPending || updateOrderMutation.isPending}
      />

      <WhatsAppAIModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        order={whatsAppTargetOrder}
      />
    </div>
  );
}
