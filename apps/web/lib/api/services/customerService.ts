import { api } from "../utils/fetchClient";
import type {
  CustomerConnectionCreatePayload,
  CustomerConnectionResponse,
  PaginatedCustomerConnectionResponse,
} from "../../../types";

export interface GetCustomerConnectionsParams {
  status?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export const customerService = {
  async getConnections(params?: GetCustomerConnectionsParams): Promise<PaginatedCustomerConnectionResponse> {
    return await api.get<PaginatedCustomerConnectionResponse>("/customers", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async getConnectionDetail(connectionId: string): Promise<CustomerConnectionResponse> {
    return await api.get<CustomerConnectionResponse>(`/customers/${connectionId}`);
  },

  async createConnection(payload: CustomerConnectionCreatePayload): Promise<CustomerConnectionResponse> {
    return await api.post<CustomerConnectionResponse>("/customers", payload);
  },

  async acceptConnection(connectionId: string): Promise<CustomerConnectionResponse> {
    return await api.patch<CustomerConnectionResponse>(`/customers/${connectionId}/accept`);
  },
};
