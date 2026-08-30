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

  async getMe(): Promise<UserOut> {
    return await api.get<UserOut>("/auth/me");
  },

  logout(): void {
    tokenStorage.clearTokens();
  },
};
