import type { LucideIcon } from "lucide-react";

export interface UserNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  location: string;
  area: string;
  popularItems: string[];
}

export interface CartItem {
  name: string;
  qty: number;
  price: number;
}

export interface CartSummary {
  items: CartItem[];
  total: number;
  paymentUrl: string;
}

export interface UserChatMessage {
  id: string;
  sender: "customer" | "assistant";
  text: string;
  cart?: CartSummary;
}
