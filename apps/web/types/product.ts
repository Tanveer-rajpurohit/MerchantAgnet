export interface ProductResponse {
  id: string;
  merchant_id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  low_stock_alert?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  product_name: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  low_stock_alert?: number | null;
}

export interface ProductUpdatePayload {
  product_name?: string;
  cost_price?: number;
  selling_price?: number;
  current_stock?: number;
  low_stock_alert?: number | null;
  is_active?: boolean;
}
