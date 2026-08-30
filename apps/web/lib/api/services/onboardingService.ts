import { api } from "../utils/fetchClient";
import type {
  OnboardingStepResponse,
  OnboardingProfilePayload,
  OnboardingExpensesPayload,
  OnboardingExpensesResponse,
  OnboardingProductsPayload,
  OnboardingProductsResponse,
  OnboardingCompletePayload,
} from "../../../types";

export const onboardingService = {
  async saveProfile(
    payload: OnboardingProfilePayload
  ): Promise<OnboardingStepResponse> {
    return await api.put<OnboardingStepResponse>("/onboarding/profile", payload);
  },

  async getExpenses(): Promise<OnboardingExpensesResponse> {
    return await api.get<OnboardingExpensesResponse>("/onboarding/expenses");
  },

  async saveExpenses(
    payload: OnboardingExpensesPayload
  ): Promise<OnboardingStepResponse> {
    return await api.put<OnboardingStepResponse>("/onboarding/expenses", payload);
  },

  async getProducts(): Promise<OnboardingProductsResponse> {
    return await api.get<OnboardingProductsResponse>("/onboarding/products");
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
