import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { notifyError } from "../lib/notifications";
import type { AuthResponse } from "../types";
import { tokenStorage } from "../utils/tokenStorage";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const API_BASE_URL = normalizedBaseUrl.endsWith("/api/v1") ? normalizedBaseUrl : `${normalizedBaseUrl}/api/v1`;

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean; _skipGlobalErrorToast?: boolean };

function extractErrorMessage(error: AxiosError): string {
  const detail = error.response?.data;
  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object") {
    const message = (detail as Record<string, unknown>).detail ?? (detail as Record<string, unknown>).message;
    if (typeof message === "string") {
      return message;
    }
  }
  return error.message || "Request failed.";
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken && !originalRequest.url?.includes("/auth/refresh")) {
        originalRequest._retry = true;
        try {
          const { data } = await refreshClient.post<AuthResponse>("/auth/refresh", {
            refresh_token: refreshToken,
          });
          tokenStorage.setTokens(data.tokens);
          originalRequest.headers.Authorization = `Bearer ${data.tokens.access_token}`;
          return api(originalRequest);
        } catch {
          tokenStorage.clear();
          if (window.location.hash !== "#/login") {
            window.location.hash = "#/login";
          }
        }
      } else {
        tokenStorage.clear();
        if (window.location.hash !== "#/login") {
          window.location.hash = "#/login";
        }
      }
    }

    if (!originalRequest?._skipGlobalErrorToast) {
      notifyError(extractErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export default api;
