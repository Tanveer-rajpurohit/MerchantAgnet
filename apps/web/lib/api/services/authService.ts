import { api } from "../utils/fetchClient";
import { tokenStorage } from "../utils/tokenStorage";
import type {
  AuthTokensResponse,
  AccessTokenResponse,
  RegisterPayload,
  LoginPayload,
  GoogleAuthPayload,
  UserOut,
} from "../../../types";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokensResponse> {
    const data = await api.post<AuthTokensResponse>("/auth/register", payload, {
      skipAuth: true,
    });
    tokenStorage.setTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokensResponse> {
    const data = await api.post<AuthTokensResponse>("/auth/login", payload, {
      skipAuth: true,
    });
    tokenStorage.setTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    return data;
  },

  async googleAuth(payload: GoogleAuthPayload): Promise<AuthTokensResponse> {
    const data = await api.post<AuthTokensResponse>("/auth/google", payload, {
      skipAuth: true,
    });
    tokenStorage.setTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
    return data;
  },

  async refreshToken(refreshToken: string): Promise<AccessTokenResponse> {
    const data = await api.post<AccessTokenResponse>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { skipAuth: true }
    );
    tokenStorage.setAccessToken(data.access_token);
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email },
      { skipAuth: true }
    );
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return await api.post<{ message: string }>(
      "/auth/reset-password",
      { email, code, new_password: newPassword },
      { skipAuth: true }
    );
  },

  async getMe(): Promise<UserOut> {
    return await api.get<UserOut>("/auth/me");
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post(
          "/auth/logout",
          { refresh_token: refreshToken },
          { skipAuth: true }
        );
      } catch {
      }
    }
    tokenStorage.clearTokens();
  },
};
