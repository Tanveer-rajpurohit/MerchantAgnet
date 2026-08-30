import { api } from "../fetchClient";
import type {
  OnboardingStepResponse,
  OnboardingProfilePayload,
  OnboardingExpensesPayload,
  OnboardingProductsPayload,
  OnboardingCompletePayload,
} from "../../../types";

export const onboardingService = {
  async saveProfile(
    payload: OnboardingProfilePayload
  ): Promise<OnboardingStepResponse> {
    return await api.put<OnboardingStepResponse>("/onboarding/profile", payload);
  },

  async saveExpenses(
    payload: OnboardingExpensesPayload
  ): Promise<OnboardingStepResponse> {
    return await api.put<OnboardingStepResponse>("/onboarding/expenses", payload);
  },

  async saveProducts(
    payload: OnboardingProductsPayload
  ): Promise<OnboardingStepResponse> {
    return await api.put<OnboardingStepResponse>("/onboarding/products", payload);
  },

  async completeOnboarding(
    payload: OnboardingCompletePayload
  ): Promise<OnboardingStepResponse> {
    return await api.post<OnboardingStepResponse>("/onboarding/complete", payload);
  },
};
