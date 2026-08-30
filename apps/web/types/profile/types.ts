import type { UserRole } from "../auth/types";

export interface AddressDTO {
  line1?: string | null;
  line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string;
}

export interface ExpenseDTO {
  id?: string | null;
  category: string;
  amount: number | string;
  due_on?: string;
  notes?: string | null;
}

export interface AIInfoDTO {
  help_with: string;
  rule?: string | null;
}

export interface MerchantProfileDTO {
  business_name?: string | null;
  business_type?: string | null;
  business_description?: string | null;
  gstin?: string | null;
  upi_vpa?: string | null;
  preferred_language?: string;
  is_razorpay_active?: boolean;
  expenses?: ExpenseDTO[];
}

export interface SettingsResponse {
  show_mobile_number: boolean;
  show_email: boolean;
  ai_info?: AIInfoDTO | null;
}

export interface UpdateSettingsPayload {
  show_mobile_number?: boolean | null;
  show_email?: boolean | null;
  ai_info?: AIInfoDTO | null;
}

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
  profile_picture?: string | null;
  role: UserRole;
  merchant_profile?: MerchantProfileDTO | null;
  address?: AddressDTO | null;
  settings?: SettingsResponse | null;
}

export interface UpdateProfilePayload {
  full_name?: string | null;
  phone_number?: string | null;
  business_name?: string | null;
  business_type?: string | null;
  business_description?: string | null;
  gstin?: string | null;
  upi_vpa?: string | null;
  preferred_language?: string | null;
  address?: AddressDTO | null;
}

export interface AvatarResponse {
  avatar_url: string;
  message: string;
}
