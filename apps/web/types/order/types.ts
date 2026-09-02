export type OrderStatus = "unpaid" | "partially_paid" | "paid" | "cancelled";
export type ActorType = "merchant" | "customer" | "ai_agent" | "system";

export interface OrderItemCreate {
  product_id?: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: number;
}

export interface OrderItemResponse {
  id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: number | string;
  created_at: string;
}

export interface OrderStatusHistoryResponse {
  id: string;
  previous_status?: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: ActorType;
  reason?: string | null;
  created_at: string;
}

export interface OrderCreatePayload {
  merchant_id?: string;
  customer_id?: string;
  customer_connection_id?: string;
  items: OrderItemCreate[];
  paid_amount?: number;
  status?: OrderStatus;
  created_by?: ActorType;
}

export interface OrderUpdatePayload {
  status?: OrderStatus;
  paid_amount?: number;
  reason?: string;
}

export interface OrderResponse {
  id: string;
  merchant_id: string;
  store_name: string;
  customer_id: string;
  customer_connection_id?: string | null;
  customer_name: string;
  customer_phone?: string | null;
  customer_email: string;
  total_amount: number | string;
  paid_amount: number | string;
  status: OrderStatus;
  items: OrderItemResponse[];
  status_history: OrderStatusHistoryResponse[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrderResponse {
  items: OrderResponse[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount?: number;
  paidAmount?: number;
  total?: number;
  status: OrderStatus | "Paid" | "Unpaid" | "Cancelled";
  date: string;
}
