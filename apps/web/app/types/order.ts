export type OrderStatus = "Unpaid" | "Paid" | "Cancelled";

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: OrderStatus;
  date: string;
}
