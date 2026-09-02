export interface RazorpayConnectPayload {
  key_id: string;
  key_secret: string;
}

export interface RazorpayVerifyResponse {
  valid: boolean;
  mode: "test" | "live";
}

export interface RazorpayStatusResponse {
  is_connected: boolean;
  mode: "test" | "live";
  key_id_masked: string | null;
  connected_at: string | null;
}
