export interface OnboardingStepResponse {
  step: string;
  status: string;
  count?: number | null;
}

export interface OnboardingProfilePayload {
  business_name: string;
  business_type: string;
  business_description?: string | null;
  city: string;
  preferred_language?: string;
  owner_name?: string | null;
}

export interface OnboardingExpenseRow {
  category: string;
  amount: number | string;
  due_on?: string;
  notes?: string | null;
}

export interface OnboardingExpenseDTO {
  id: string;
  category: string;
  amount: number;
  due_on?: string | null;
  notes?: string | null;
}

export interface OnboardingExpensesResponse {
  expenses: OnboardingExpenseDTO[];
}

export interface OnboardingExpensesPayload {
  expenses: OnboardingExpenseRow[];
}

export interface OnboardingProductRow {
  product_name: string;
  cost_price: number | string;
  selling_price: number | string;
  current_stock?: number;
  low_stock_alert?: number;
}

export interface OnboardingProductDTO {
  id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  low_stock_alert: number;
}

export interface OnboardingProductsResponse {
  products: OnboardingProductDTO[];
}

export interface OnboardingProductsPayload {
  products: OnboardingProductRow[];
  skip_inventory?: boolean;
}

export interface OnboardingCompletePayload {
  selected_goals: string[];
  other_goal_text?: string | null;
  additional_details?: string | null;
}

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
