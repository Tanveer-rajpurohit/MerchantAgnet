import { api } from "../utils/fetchClient";
import type {
  RazorpayConnectPayload,
  RazorpayVerifyResponse,
  RazorpayStatusResponse,
} from "../../../types";

export const razorpayService = {
  async verifyKeys(payload: RazorpayConnectPayload): Promise<RazorpayVerifyResponse> {
    return await api.post<RazorpayVerifyResponse>("/merchants/razorpay/verify", payload);
  },

  async connectKeys(payload: RazorpayConnectPayload): Promise<RazorpayStatusResponse> {
    return await api.post<RazorpayStatusResponse>("/merchants/razorpay/connect", payload);
  },

  async disconnectKeys(): Promise<RazorpayStatusResponse> {
    return await api.post<RazorpayStatusResponse>("/merchants/razorpay/disconnect");
  },

  async getStatus(): Promise<RazorpayStatusResponse> {
    return await api.get<RazorpayStatusResponse>("/merchants/razorpay/status");
  },
};
