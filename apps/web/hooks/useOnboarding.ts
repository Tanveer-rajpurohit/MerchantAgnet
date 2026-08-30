"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingService } from "../lib/api/services/onboardingService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  OnboardingStepResponse,
  OnboardingProfilePayload,
  OnboardingExpensesPayload,
  OnboardingProductsPayload,
  OnboardingCompletePayload,
} from "../types";

export function useOnboarding() {
  const queryClient = useQueryClient();

  const saveProfileMutation = useMutation({
    mutationFn: (payload: OnboardingProfilePayload) => onboardingService.saveProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
    },
  });

  const saveExpensesMutation = useMutation({
    mutationFn: (payload: OnboardingExpensesPayload) => onboardingService.saveExpenses(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });

  const saveProductsMutation = useMutation({
    mutationFn: (payload: OnboardingProductsPayload) => onboardingService.saveProducts(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.root });
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: (payload: OnboardingCompletePayload) => onboardingService.completeOnboarding(payload),
    onSuccess: async () => {
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
