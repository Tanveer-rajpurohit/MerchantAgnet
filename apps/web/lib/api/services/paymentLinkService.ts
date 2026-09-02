import { api } from "../utils/fetchClient";
import type {
  PaymentLinkCreatePayload,
  PaymentLinkVerifyPayload,
  PaymentLinkRecord,
  PaymentLinkListResponse,
  PaymentLinkListParams,
} from "../../../types";

export const paymentLinkService = {
  async createPaymentLink(payload: PaymentLinkCreatePayload): Promise<PaymentLinkRecord> {
    return await api.post<PaymentLinkRecord>("/payment-links", payload);
  },

  async listPaymentLinks(params?: PaymentLinkListParams): Promise<PaymentLinkListResponse> {
    return await api.get<PaymentLinkListResponse>("/payment-links", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getPaymentLink(linkId: string): Promise<PaymentLinkRecord> {
    return await api.get<PaymentLinkRecord>(`/payment-links/${linkId}`);
  },

  async verifyPayment(payload: PaymentLinkVerifyPayload): Promise<PaymentLinkRecord> {
    return await api.post<PaymentLinkRecord>("/payment-links/verify-payment", payload);
  },

  async syncPaymentLink(linkId: string): Promise<PaymentLinkRecord> {
    return await api.post<PaymentLinkRecord>(`/payment-links/${linkId}/sync`);
  },
};
