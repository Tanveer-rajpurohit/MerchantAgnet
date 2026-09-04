import { api } from "../utils/fetchClient";
import type { PaginatedMessageResponse, GetMessagesParams } from "../../../types";

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
