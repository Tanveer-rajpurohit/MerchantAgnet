export interface PayoutRecord {
  id: string;
  description: string;
  amount: string;
  method: string;
  date: string;
  status: "Settled" | "Pending";
}
