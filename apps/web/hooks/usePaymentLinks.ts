"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentLinkService } from "../lib/api/services/paymentLinkService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  PaymentLinkCreatePayload,
  PaymentLinkVerifyPayload,
  PaymentLinkRecord,
  PaymentLinkListResponse,
  PaymentLinkListParams,
} from "../types";

export function usePaymentLinks(params?: PaymentLinkListParams) {
  return useQuery<PaymentLinkListResponse>({
    queryKey: queryKeys.paymentLinks.list(params as Record<string, unknown>),
    queryFn: () => paymentLinkService.listPaymentLinks(params),
    placeholderData: (prev) => prev,
    enabled: tokenStorage.hasTokens(),
  });
}

export function usePaymentLinkDetail(id: string) {
  return useQuery<PaymentLinkRecord>({
    queryKey: queryKeys.paymentLinks.detail(id),
    queryFn: () => paymentLinkService.getPaymentLink(id),
    enabled: Boolean(id) && tokenStorage.hasTokens(),
  });
}

export function useCreatePaymentLink() {
  const queryClient = useQueryClient();

  return useMutation<PaymentLinkRecord, Error, PaymentLinkCreatePayload>({
    mutationFn: (payload: PaymentLinkCreatePayload) =>
      paymentLinkService.createPaymentLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentLinks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.summary });
    },
  });
}

export function useSyncPaymentLink() {
  const queryClient = useQueryClient();

  return useMutation<PaymentLinkRecord, Error, string>({
    mutationFn: (linkId: string) => paymentLinkService.syncPaymentLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentLinks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.summary });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentLinkRecord, Error, PaymentLinkVerifyPayload>({
    mutationFn: (payload: PaymentLinkVerifyPayload) =>
      paymentLinkService.verifyPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentLinks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payouts.summary });
    },
  });
}
