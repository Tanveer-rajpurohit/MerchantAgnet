import { api } from "../utils/fetchClient";
import type { PaginatedMessageResponse } from "../../../types";

export interface GetMessagesParams {
  cursor?: string;
  limit?: number;
}

export const messageService = {
  async getMessages(
    connectionId: string,
    params?: GetMessagesParams,
  ): Promise<PaginatedMessageResponse> {
    return await api.get<PaginatedMessageResponse>(`/messages/${connectionId}`, {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },
};
