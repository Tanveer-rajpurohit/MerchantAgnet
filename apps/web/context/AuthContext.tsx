"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuthQuery } from "../hooks/useAuth";
import type {
  UserOut,
  LoginPayload,
  RegisterPayload,
  GoogleAuthPayload,
  AuthTokensResponse,
} from "../types";

export interface AuthContextValue {
  user: UserOut | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  login: (payload: LoginPayload) => Promise<AuthTokensResponse>;
  register: (payload: RegisterPayload) => Promise<AuthTokensResponse>;
  googleAuth: (payload: GoogleAuthPayload) => Promise<AuthTokensResponse>;
  logout: () => Promise<void>;
  refetchUser: () => void;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isGoogleAuthenticating: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthQuery();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
