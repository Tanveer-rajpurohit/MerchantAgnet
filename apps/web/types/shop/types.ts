export const SHOP_CATEGORIES = [
  "All",
  "Kirana / Grocery",
  "D2C / Brand",
  "Service (salon, tuition, repair)",
  "Local E-com",
  "Restaurant / Food",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export interface ShopAddress {
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface ShopProduct {
  id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  is_active: boolean;
}

export interface ShopListItem {
  id: string;
  business_name: string;
  business_type: string;
  owner_name: string;
  owner_phone?: string | null;
  city?: string | null;
  area?: string | null;
  address?: ShopAddress | null;
  popular_products: string[];
  created_at: string;
}

export interface ShopDetail extends ShopListItem {
  business_description?: string | null;
  upi_vpa?: string | null;
  preferred_language: string;
  products: ShopProduct[];
  customer_connection_id?: string | null;
  conversation_id?: string | null;
}

export interface PaginatedShopResponse {
  items: ShopListItem[];
  next_cursor?: string | null;
  has_more: boolean;
}
