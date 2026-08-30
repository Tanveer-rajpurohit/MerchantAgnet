import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  OnboardingProfilePayload,
  OnboardingExpenseRow,
  OnboardingProductRow,
} from "../types";

export interface GoalsDraft {
  selectedGoals: string[];
  otherGoalText: string;
  additionalDetails: string;
}

export interface OnboardingState {
  currentStep: number;
  profile: OnboardingProfilePayload;
  expenses: OnboardingExpenseRow[];
  products: OnboardingProductRow[];
  skipInventory: boolean;
  goals: GoalsDraft;

  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProfile: (profile: Partial<OnboardingProfilePayload>) => void;
  setExpenses: (expenses: OnboardingExpenseRow[]) => void;
  setProducts: (products: OnboardingProductRow[]) => void;
  setSkipInventory: (skip: boolean) => void;
  setGoals: (goals: Partial<GoalsDraft>) => void;
  resetOnboarding: () => void;
}

const INITIAL_PROFILE: OnboardingProfilePayload = {
  business_name: "",
  business_type: "",
  business_description: "",
  city: "",
  preferred_language: "English",
  owner_name: "",
};

const INITIAL_EXPENSES: OnboardingExpenseRow[] = [
  {
    category: "Shop Rent",
    amount: "15000",
    due_on: "5th of month",
    notes: "",
  },
  {
    category: "Staff Salary",
    amount: "25000",
    due_on: "1st of month",
    notes: "2 staff",
  },
  {
    category: "Electricity + Water",
    amount: "3500",
    due_on: "10th of month",
    notes: "",
  },
];

const INITIAL_PRODUCTS: OnboardingProductRow[] = [
  {
    product_name: "Maggi 12-pack",
    cost_price: "120",
    selling_price: "145",
    current_stock: 48,
    low_stock_alert: 10,
  },
  {
    product_name: "Amul Milk 1L",
    cost_price: "58",
    selling_price: "62",
    current_stock: 30,
    low_stock_alert: 15,
  },
];

const INITIAL_GOALS: GoalsDraft = {
  selectedGoals: [],
  otherGoalText: "",
  additionalDetails: "",
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      profile: INITIAL_PROFILE,
      expenses: INITIAL_EXPENSES,
      products: INITIAL_PRODUCTS,
      skipInventory: false,
      goals: INITIAL_GOALS,

      setCurrentStep: (step: number) =>
        set({ currentStep: Math.max(0, Math.min(step, 4)) }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      setProfile: (profileUpdates: Partial<OnboardingProfilePayload>) =>
        set((state) => ({
          profile: { ...state.profile, ...profileUpdates },
        })),

      setExpenses: (expenses: OnboardingExpenseRow[]) =>
        set({ expenses }),

      setProducts: (products: OnboardingProductRow[]) =>
        set({ products }),

      setSkipInventory: (skip: boolean) =>
        set({ skipInventory: skip }),

      setGoals: (goalsUpdates: Partial<GoalsDraft>) =>
        set((state) => ({
          goals: { ...state.goals, ...goalsUpdates },
        })),

      resetOnboarding: () =>
        set({
          currentStep: 0,
          profile: INITIAL_PROFILE,
          expenses: INITIAL_EXPENSES,
          products: INITIAL_PRODUCTS,
          skipInventory: false,
          goals: INITIAL_GOALS,
        }),
    }),
    {
      name: "merchant_agent_onboarding_draft",
    }
  )
);
