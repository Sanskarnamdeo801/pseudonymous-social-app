import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { tokenStorage } from "../utils/tokenStorage";
import type { AuthResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
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
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken || originalRequest.url?.includes("/auth/refresh")) {
      tokenStorage.clear();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      const { data } = await refreshClient.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken });
      tokenStorage.setTokens(data.tokens);
      originalRequest.headers.Authorization = `Bearer ${data.tokens.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      return Promise.reject(refreshError);
    }
  },
);

export default api;

