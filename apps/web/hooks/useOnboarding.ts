"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingService } from "../lib/api/services/onboardingService";
import { tokenStorage } from "../lib/api/utils/tokenStorage";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  OnboardingStepResponse,
  OnboardingProfilePayload,
  OnboardingExpensesPayload,
  OnboardingExpensesResponse,
  OnboardingProductsPayload,
  OnboardingProductsResponse,
  OnboardingCompletePayload,
  UserOut,
  ProfileResponse,
} from "../types";

export function useOnboarding() {
  const queryClient = useQueryClient();

  const { data: savedExpensesData, isLoading: isLoadingExpenses } = useQuery<OnboardingExpensesResponse>({
    queryKey: queryKeys.onboarding.expenses,
    queryFn: () => onboardingService.getExpenses(),
    enabled: tokenStorage.hasTokens(),
  });

  const { data: savedProductsData, isLoading: isLoadingProducts } = useQuery<OnboardingProductsResponse>({
    queryKey: queryKeys.onboarding.products,
    queryFn: () => onboardingService.getProducts(),
    enabled: tokenStorage.hasTokens(),
  });

  const saveProfileMutation = useMutation({
    mutationFn: (payload: OnboardingProfilePayload) => onboardingService.saveProfile(payload),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(queryKeys.profile.root, (old: ProfileResponse | null | undefined) => {
        if (!old) return old;
        return {
          ...old,
          merchant_profile: old.merchant_profile
            ? {
                ...old.merchant_profile,
                business_name: variables.business_name,
                business_type: variables.business_type,
                business_description: variables.business_description || null,
                preferred_language: variables.preferred_language || old.merchant_profile.preferred_language,
              }
            : null,
          address: old.address
            ? {
                ...old.address,
                city: variables.city,
              }
            : null,
        };
      });
    },
  });

  const saveExpensesMutation = useMutation({
    mutationFn: (payload: OnboardingExpensesPayload) => onboardingService.saveExpenses(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.expenses });
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });

  const saveProductsMutation = useMutation({
    mutationFn: (payload: OnboardingProductsPayload) => onboardingService.saveProducts(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.products });
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: (payload: OnboardingCompletePayload) => onboardingService.completeOnboarding(payload),
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.auth.me, (old: UserOut | null | undefined) => {
        if (!old) return old;
        return { ...old, is_onboarded: true };
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const saveProfile = async (payload: OnboardingProfilePayload): Promise<OnboardingStepResponse> => {
    return await saveProfileMutation.mutateAsync(payload);
  };

  const saveExpenses = async (payload: OnboardingExpensesPayload): Promise<OnboardingStepResponse> => {
    return await saveExpensesMutation.mutateAsync(payload);
  };

  const saveProducts = async (payload: OnboardingProductsPayload): Promise<OnboardingStepResponse> => {
    return await saveProductsMutation.mutateAsync(payload);
  };

  const completeOnboarding = async (payload: OnboardingCompletePayload): Promise<OnboardingStepResponse> => {
    return await completeOnboardingMutation.mutateAsync(payload);
  };

  return {
    savedExpenses: savedExpensesData?.expenses ?? [],
    savedProducts: savedProductsData?.products ?? [],
    isLoadingExpenses,
    isLoadingProducts,
    saveProfile,
    saveExpenses,
    saveProducts,
    completeOnboarding,
    isSavingProfile: saveProfileMutation.isPending,
    isSavingExpenses: saveExpensesMutation.isPending,
    isSavingProducts: saveProductsMutation.isPending,
    isCompleting: completeOnboardingMutation.isPending,
  };
}
