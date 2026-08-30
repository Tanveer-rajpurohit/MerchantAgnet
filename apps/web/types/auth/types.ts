export type UserRole = "merchant" | "customer";

export interface UserOut {
  id: string;
  email: string;
  phone_number: string | null;
  full_name: string;
  role: UserRole;
  profile_picture: string | null;
  is_active: boolean;
  is_phone_verified: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  id_token: string;
  role?: UserRole;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}
