import axios from "axios";

import { useAuthStore } from "../../store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }
  }

  const token = useAuthStore.getState().accessToken;
  const isAuthRoute = config.url?.includes("/auth/login")
    || config.url?.includes("/auth/register")
    || config.url?.includes("/auth/refresh")
    || config.url?.includes("/auth/verify-email")
    || config.url?.includes("/auth/resend-verification")
    || config.url?.includes("/auth/forgot-password")
    || config.url?.includes("/auth/verify-reset-otp")
    || config.url?.includes("/auth/reset-password");

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | { _retry?: boolean; url?: string; headers: Record<string, string> }
      | undefined;

    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes("/auth/refresh") ||
      original.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    try {
      refreshPromise ??= apiClient
        .post("/auth/refresh", { refresh_token: refreshToken })
        .then((response) => {
          const access = response.data.access_token as string;
          const refresh = response.data.refresh_token as string;
          useAuthStore.getState().setTokens({
            accessToken: access,
            refreshToken: refresh,
          });
          return access;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const access = await refreshPromise;
      if (!access) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${access}`;
      return apiClient(original);
    } catch {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }
  },
);
