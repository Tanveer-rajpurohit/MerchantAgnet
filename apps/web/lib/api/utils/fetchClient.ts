import { tokenStorage } from "./tokenStorage";
import type { AccessTokenResponse, ApiErrorPayload, ApiValidationErrorItem } from "../../../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const NO_REFRESH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/google",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

function isAuthRouteWithoutRefresh(endpoint: string): boolean {
  return NO_REFRESH_ROUTES.some((route) => endpoint.includes(route));
}

async function executeRefresh(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clearTokens();
    throw new ApiError(response.status, "Session expired, please sign in again");
  }

  const data: AccessTokenResponse = await response.json();
  tokenStorage.setAccessToken(data.access_token);
  return data.access_token;
}

function parseErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null) {
    const errorPayload = data as ApiErrorPayload;
    if (typeof errorPayload.detail === "string") {
      return errorPayload.detail;
    }
    if (Array.isArray(errorPayload.detail) && errorPayload.detail.length > 0) {
      const firstItem = errorPayload.detail[0] as ApiValidationErrorItem;
      if (firstItem?.msg) {
        return firstItem.msg;
      }
    }
  }
  return fallback;
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    throw new ApiError(401, "Session expired, please sign in again");
  }

  if (isRefreshing) {
    return await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new ApiError(408, "Token refresh timed out, please reload"));
      }, 10_000);
      failedQueue.push({
        resolve: (token: string) => { clearTimeout(timeout); resolve(token); },
        reject: (err: unknown) => { clearTimeout(timeout); reject(err); },
      });
    });
  }

  isRefreshing = true;

  try {
    const newToken = await executeRefresh();
    processQueue(null, newToken);
    return newToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
}

export async function fetchClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const requestHeaders = new Headers(headers);

  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined && body !== null) {
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
    requestBody = JSON.stringify(body);
  }

  const config: RequestInit = {
    ...customConfig,
    headers: requestHeaders,
    body: requestBody,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new ApiError(0, "Network connection error", error);
  }

  if (response.status === 401 && !skipAuth && !isAuthRouteWithoutRefresh(endpoint)) {
    const newToken = await refreshAccessToken();
    requestHeaders.set("Authorization", `Bearer ${newToken}`);
    return await fetchClient<T>(endpoint, {
      ...options,
      headers: requestHeaders,
    });
  }

  if (!response.ok) {
    let errorData: unknown = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    const message = parseErrorMessage(
      errorData,
      `Request failed with status ${response.status}`
    );
    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return fetchClient<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchClient<T>(endpoint, { ...options, method: "POST", body });
  },

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchClient<T>(endpoint, { ...options, method: "PUT", body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchClient<T>(endpoint, { ...options, method: "PATCH", body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return fetchClient<T>(endpoint, { ...options, method: "DELETE" });
  },
};
