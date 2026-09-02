export type PaymentLinkStatus =
  | "created"
  | "partially_paid"
  | "paid"
  | "expired"
  | "cancelled";

export interface PaymentLinkCreatePayload {
  amount: number;
  currency?: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  description: string;
  order_id?: string | null;
  customer_id?: string | null;
  notify_sms?: boolean;
  notify_email?: boolean;
}

export interface PaymentLinkVerifyPayload {
  razorpay_payment_id: string;
  razorpay_payment_link_id: string;
  razorpay_signature: string;
  razorpay_payment_link_reference_id?: string | null;
  razorpay_payment_link_status?: string | null;
}

export interface PaymentLinkRecord {
  id: string;
  merchant_id: string;
  order_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  description: string;
  amount: number;
  currency: string;
  receipt_number: string | null;
  razorpay_link_id: string | null;
  razorpay_link_url: string | null;
  callback_url: string | null;
  callback_method: string;
  razorpay_payment_id: string | null;
  payment_method: string | null;
  status: PaymentLinkStatus;
  notify_sms: boolean;
  notify_email: boolean;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  updated_at: string;
}

export interface PaymentLinkListResponse {
  items: PaymentLinkRecord[];
  total_count: number;
  page: number;
  count: number;
  total_pages: number;
}

export interface PaymentLinkListParams {
  page?: number;
  count?: number;
  status?: PaymentLinkStatus;
  search?: string;
}

export type SettlementStatus = "pending" | "processed" | "failed";

export interface SettlementRecord {
  id: string;
  merchant_id: string;
  razorpay_settlement_id: string;
  amount: number;
  fee: number;
  tax: number;
  net_amount: number;
  currency: string;
  utr: string | null;
  method: string;
  status: SettlementStatus;
  created_at: string;
  settled_at: string | null;
  updated_at: string;
}

export interface SettlementListResponse {
  items: SettlementRecord[];
  total_count: number;
  page: number;
  count: number;
  total_pages: number;
}

export interface SettlementListParams {
  page?: number;
  count?: number;
  status?: SettlementStatus;
}

export interface PayoutsSummaryResponse {
  available_balance: number;
  total_settled: number;
  pending_settlement: number;
  settlement_count: number;
}

export interface PayoutRecord {
  id: string;
  description: string;
  amount: string;
  method: string;
  date: string;
  status: "Settled" | "Pending";
}

