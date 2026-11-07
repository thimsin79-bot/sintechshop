"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "./auth-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<string | null>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}): AuthUser {
  return {
    id: user.id ?? "",
    name: user.name || user.email || "User",
    email: user.email ?? "",
    role: user.role || "Sales Staff",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const result = await authClient.getSession();
      const sessionUser = result.data?.user;
      setUser(sessionUser ? toAuthUser(sessionUser) : null);
    } catch (error) {
      console.warn("Unable to read the current session.", error);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember: boolean,
    ): Promise<string | null> => {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: remember,
      });

      if (result.error) {
        return result.error.message || "Incorrect email or password";
      }

      await refresh();
      return null;
    },
    [refresh],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<string | null> => {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        return result.error.message || "Unable to create account";
      }

      const session = await authClient.getSession();
      if (!session.data?.user) {
        const signIn = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (signIn.error) {
          return (
            signIn.error.message ||
            "Account created. Check your email to verify it, then sign in."
          );
        }
      }

      await refresh();
      return null;
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.warn("Unable to sign out.", error);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
