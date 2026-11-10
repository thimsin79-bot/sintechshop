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
  username: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<string | null>;
  register: (
    username: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => Promise<void>;
}

const USERNAME_DOMAIN = "@sintech.local";

function toAuthEmail(identifier: string): string {
  const value = identifier.trim().toLowerCase();
  return value.includes("@") ? value : `${value}${USERNAME_DOMAIN}`;
}

function fromAuthEmail(email: string | null | undefined): string {
  if (!email) return "";
  const value = email.toLowerCase();
  return value.endsWith(USERNAME_DOMAIN)
    ? value.slice(0, -USERNAME_DOMAIN.length)
    : value;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  USER_ALREADY_EXISTS: "That username is already taken. Try signing in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "That username is already taken. Try signing in instead.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  INVALID_ORIGIN:
    "Sign-in is not allowed from this domain. Contact an administrator.",
  INVALID_EMAIL: "Enter a valid username.",
  EMAIL_NOT_VERIFIED:
    "Your account is not verified yet. Contact an administrator.",
};

function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object") {
    const candidate = error as {
      code?: unknown;
      message?: unknown;
      error?: { code?: unknown; message?: unknown } | unknown;
    };
    const raw =
      candidate.error && typeof candidate.error === "object"
        ? (candidate.error as { code?: unknown; message?: unknown })
        : undefined;
    const code =
      typeof raw?.code === "string"
        ? raw.code
        : typeof candidate.code === "string"
          ? candidate.code
          : "";
    const message =
      typeof raw?.message === "string" && raw.message.trim()
        ? raw.message
        : typeof candidate.message === "string" && candidate.message.trim()
          ? candidate.message
          : "";

    if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
    if (message) return message;
  }

  return fallback;
}

function toAuthUser(user: {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}): AuthUser {
  const username = fromAuthEmail(user.email);
  return {
    id: user.id ?? "",
    name: user.name || username || "User",
    username,
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
      username: string,
      password: string,
      remember: boolean,
    ): Promise<string | null> => {
      try {
        const result = await authClient.signIn.email({
          email: toAuthEmail(username),
          password,
          rememberMe: remember,
        });

        if (result.error) {
          return authErrorMessage(
            result.error,
            "Incorrect username or password",
          );
        }
      } catch (error) {
        return authErrorMessage(
          error,
          "Unable to sign in. Please try again.",
        );
      }

      await refresh();
      return null;
    },
    [refresh],
  );

  const register = useCallback(
    async (
      username: string,
      password: string,
    ): Promise<string | null> => {
      const authEmail = toAuthEmail(username);

      try {
        const result = await authClient.signUp.email({
          name: username.trim(),
          email: authEmail,
          password,
        });

        if (result.error) {
          return authErrorMessage(result.error, "Unable to create account");
        }
      } catch (error) {
        return authErrorMessage(
          error,
          "Unable to create account. Please try again.",
        );
      }

      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          const signIn = await authClient.signIn.email({
            email: authEmail,
            password,
          });
          if (signIn.error) {
            return authErrorMessage(
              signIn.error,
              "Account created. Check your email to verify it, then sign in.",
            );
          }
        }
      } catch (error) {
        return authErrorMessage(
          error,
          "Account created, but we could not start your session. Please sign in.",
        );
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
