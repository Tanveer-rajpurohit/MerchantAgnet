import { api } from "../utils/fetchClient";
import type {
  PaginatedMessageResponse,
  GetMessagesParams,
  DirectMessagePayload,
  DirectMessageResponse,
} from "../../../types";

export const messageService = {
  async getMessages(
    connectionId: string,
    params?: GetMessagesParams,
  ): Promise<PaginatedMessageResponse> {
    return await api.get<PaginatedMessageResponse>(`/messages/${connectionId}`, {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  async sendDirectMessage(
    payload: DirectMessagePayload,
  ): Promise<DirectMessageResponse> {
    return await api.post<DirectMessageResponse>("/messages/send-direct", payload);
  },
};
