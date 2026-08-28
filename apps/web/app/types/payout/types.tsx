export interface PayoutRecord {
  id: string;
  description: string;
  amount: string;
  method: string;
  date: string;
  status: "Settled" | "Pending";
}

export interface PaymentLinkRecord {
  id: string;
  customerName: string;
  description: string;
  amount: string;
  status: "Paid" | "Pending" | "Expired";
  date: string;
  linkUrl: string;
}
