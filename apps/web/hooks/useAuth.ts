"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../lib/api/services/authService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  UserOut,
  LoginPayload,
  RegisterPayload,
  GoogleAuthPayload,
  AuthTokensResponse,
} from "../types";

export function useAuthQuery() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, error, refetch: refetchUser } = useQuery<UserOut>({
    queryKey: queryKeys.auth.me,
    queryFn: () => authService.getMe(),
    enabled: tokenStorage.hasTokens(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: (payload: GoogleAuthPayload) => authService.googleAuth(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const login = async (payload: LoginPayload): Promise<AuthTokensResponse> => {
    return await loginMutation.mutateAsync(payload);
  };

  const register = async (payload: RegisterPayload): Promise<AuthTokensResponse> => {
    return await registerMutation.mutateAsync(payload);
  };

  const googleAuth = async (payload: GoogleAuthPayload): Promise<AuthTokensResponse> => {
    return await googleAuthMutation.mutateAsync(payload);
  };

  const logout = (): void => {
    authService.logout();
    queryClient.setQueryData(queryKeys.auth.me, null);
    queryClient.removeQueries();
  };

  const isAuthenticated = Boolean(user && tokenStorage.hasTokens());
  const isOnboarded = user?.role === "merchant" ? Boolean(user?.onboarding_completed_at) : true;

  return {
    user: user ?? null,
    isLoading,
    isError,
    error,
    isAuthenticated,
    isOnboarded,
    login,
    register,
    googleAuth,
    logout,
    refetchUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isGoogleAuthenticating: googleAuthMutation.isPending,
  };
}
