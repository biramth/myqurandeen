import * as React from "react";
import { tokenStore } from "@/lib/token-store";
import { ApiError } from "@/lib/api-client";
import { authApi } from "./api";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Tente une reconnexion silencieuse via le cookie refresh httpOnly.
    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        tokenStore.set(accessToken);
        const me = await authApi.me();
        setUser(me);
      } catch (error) {
        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        tokenStore.set(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = React.useCallback(async (input: { email: string; password: string }) => {
    const { user: loggedInUser, accessToken } = await authApi.login(input);
    tokenStore.set(accessToken);
    setUser(loggedInUser);
  }, []);

  const register = React.useCallback(
    async (input: { email: string; password: string; displayName: string }) => {
      const { user: newUser, accessToken } = await authApi.register(input);
      tokenStore.set(accessToken);
      setUser(newUser);
    },
    [],
  );

  const logout = React.useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.set(null);
      setUser(null);
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit etre utilise dans AuthProvider");
  return ctx;
}
