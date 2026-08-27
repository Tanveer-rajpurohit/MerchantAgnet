export interface ExpenseRow {
  id: string;
  category: string;
  amount: string;
  dueDate: string;
  notes: string;
}

export interface ProductRow {
  id: string;
  name: string;
  costPrice: string;
  sellingPrice: string;
  currentStock: string;
  lowStockAlert: string;
}

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  businessTypeOther: string;
  businessDescription: string;
  city: string;
  language: string;
  ownerName: string;
}

export interface RazorpayKeys {
  keyId: string;
  keySecret: string;
  connected: boolean;
}

export interface OnboardingState {
  profile: BusinessProfile;
  razorpayKeys: RazorpayKeys;
  expenses: ExpenseRow[];
  products: ProductRow[];
  skipInventory: boolean;
  selectedGoals: string[];
  otherGoalText: string;
  additionalDetails: string;
}
