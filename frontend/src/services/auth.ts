import api from "./api";
import type { AuthResponse, AuthUser } from "../types";

export const authService = {
  login: async (handle: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", { handle, password });
    return data;
  },
  signup: async (email: string, handle: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/signup", { email, handle, password });
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await api.get<AuthUser>("/auth/me");
    return data;
  },
  logout: async (refreshToken: string) => {
    await api.post("/auth/logout", { refresh_token: refreshToken });
  },
};

