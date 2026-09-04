import { api } from "../utils/fetchClient";
import type {
  OrderCreatePayload,
  OrderUpdatePayload,
  OrderResponse,
  PaginatedOrderResponse,
  GetMerchantOrdersParams,
  GetCustomerOrdersParams,
  OrderWhatsAppMessageResponse,
} from "../../../types";

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

  async generateWhatsAppMessage(
    orderId: string,
    mode: "both" | "reminder" = "both"
  ): Promise<OrderWhatsAppMessageResponse> {
    return await api.post<OrderWhatsAppMessageResponse>(
      `/orders/${orderId}/whatsapp-message`,
      { mode }
    );
  },
};

