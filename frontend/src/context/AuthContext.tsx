import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { notifySuccess } from "../lib/notifications";
import { authService } from "../services/auth";
import type { AuthUser } from "../types";
import { tokenStorage } from "../utils/tokenStorage";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (handle: string, password: string) => Promise<void>;
  signup: (email: string, handle: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (handle, password) => {
        const data = await authService.login(handle, password);
        tokenStorage.setTokens(data.tokens);
        setUser(data.user);
        notifySuccess("Signed in successfully.");
      },
      signup: async (email, handle, password) => {
        const data = await authService.signup(email, handle, password);
        tokenStorage.setTokens(data.tokens);
        setUser(data.user);
        notifySuccess("Account created successfully.");
      },
      logout: async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            await authService.logout(refreshToken);
          } catch {
            // local session clear still proceeds
          }
        }
        tokenStorage.clear();
        setUser(null);
      },
      refreshUser,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
