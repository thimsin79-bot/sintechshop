"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

interface DemoAccount extends AuthUser {
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Admin User",
    email: "admin@techvault.com",
    password: "admin123",
    role: "Administrator",
  },
  {
    name: "Sarah Sales",
    email: "sarah@techvault.com",
    password: "sales123",
    role: "Sales Staff",
  },
];

const SESSION_KEY = "techvault.session.v1";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.name || !parsed.email || !parsed.role) return null;

    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch (error) {
    console.warn("Unable to read saved session.", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setReady(true);
  }, []);

  const login = useCallback(
    (email: string, password: string, remember: boolean): string | null => {
      const account = DEMO_ACCOUNTS.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (!account) return "No account found with that email address";
      if (account.password !== password) return "Incorrect password";

      const session: AuthUser = {
        name: account.name,
        email: account.email,
        role: account.role,
      };

      try {
        const target = remember ? localStorage : sessionStorage;
        const other = remember ? sessionStorage : localStorage;
        target.setItem(SESSION_KEY, JSON.stringify(session));
        other.removeItem(SESSION_KEY);
      } catch (error) {
        console.warn("Unable to persist session.", error);
      }

      setUser(session);
      return null;
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn("Unable to clear session.", error);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
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
