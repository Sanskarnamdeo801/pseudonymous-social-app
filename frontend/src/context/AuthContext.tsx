import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { DEMO_USER, JWT_AUTH_DISABLED } from "../lib/guestMode";
import type { AuthUser } from "../types";

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
  const [user, setUser] = useState<AuthUser | null>(JWT_AUTH_DISABLED ? DEMO_USER : null);
  const [loading, setLoading] = useState(!JWT_AUTH_DISABLED);

  const refreshUser = async () => {
    if (JWT_AUTH_DISABLED) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async () => {
        setUser(DEMO_USER);
      },
      signup: async () => {
        setUser(DEMO_USER);
      },
      logout: async () => {
        setUser(JWT_AUTH_DISABLED ? DEMO_USER : null);
      },
      refreshUser,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
