import { api } from "../utils/fetchClient";
import type {
  OrderCreatePayload,
  OrderUpdatePayload,
  OrderResponse,
  PaginatedOrderResponse,
} from "../../../types";

export interface GetMerchantOrdersParams {
  status?: string;
  customer_id?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface GetCustomerOrdersParams {
  status?: string;
  cursor?: string;
  limit?: number;
}

export const orderService = {
  async getMerchantOrders(params?: GetMerchantOrdersParams): Promise<PaginatedOrderResponse> {
    return await api.get<PaginatedOrderResponse>("/orders", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getCustomerOrders(params?: GetCustomerOrdersParams): Promise<PaginatedOrderResponse> {
    return await api.get<PaginatedOrderResponse>("/orders/my-orders", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getOrderDetail(orderId: string): Promise<OrderResponse> {
    return await api.get<OrderResponse>(`/orders/${orderId}`);
  },

  async createOrder(payload: OrderCreatePayload): Promise<OrderResponse> {
    return await api.post<OrderResponse>("/orders", payload);
  },

  async updateOrder(orderId: string, payload: OrderUpdatePayload): Promise<OrderResponse> {
    return await api.put<OrderResponse>(`/orders/${orderId}`, payload);
  },
};
