"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { razorpayService } from "../lib/api/services/razorpayService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  RazorpayConnectPayload,
  RazorpayVerifyResponse,
  RazorpayStatusResponse,
} from "../types";

export function useRazorpay() {
  const queryClient = useQueryClient();

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<RazorpayStatusResponse>({
    queryKey: queryKeys.razorpay.status,
    queryFn: () => razorpayService.getStatus(),
    enabled: tokenStorage.hasTokens(),
  });

  const verifyMutation = useMutation<RazorpayVerifyResponse, Error, RazorpayConnectPayload>({
    mutationFn: (payload: RazorpayConnectPayload) => razorpayService.verifyKeys(payload),
  });

  const connectMutation = useMutation<RazorpayStatusResponse, Error, RazorpayConnectPayload>({
    mutationFn: (payload: RazorpayConnectPayload) => razorpayService.connectKeys(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.razorpay.status, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const disconnectMutation = useMutation<RazorpayStatusResponse, Error, void>({
    mutationFn: () => razorpayService.disconnectKeys(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.razorpay.status, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  return {
    status,
    isLoading,
    isError,
    error,
    refetch,
    verifyKeys: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    verifyError: verifyMutation.error,
    connectKeys: connectMutation.mutateAsync,
    isConnecting: connectMutation.isPending,
    connectError: connectMutation.error,
    disconnectKeys: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
    disconnectError: disconnectMutation.error,
  };
}
