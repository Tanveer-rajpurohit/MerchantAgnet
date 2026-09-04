"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api/utils/fetchClient";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  PaymentLinkListResponse,
  CustomerPaymentLinksParams,
} from "../types";

export function useCustomerPaymentLinks(params?: CustomerPaymentLinksParams) {
  return useQuery<PaymentLinkListResponse>({
    queryKey: [...queryKeys.paymentLinks.all, "my-links", params],
    queryFn: () =>
      api.get<PaymentLinkListResponse>("/payment-links/my-links", {
        params: params as Record<string, string | number | undefined>,
      }),
  });
}
