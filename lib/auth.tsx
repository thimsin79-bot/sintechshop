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
const ACCOUNTS_KEY = "techvault.accounts.v1";

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (
    email: string,
    password: string,
    remember: boolean,
  ) => string | null;
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readAccounts(): DemoAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is DemoAccount => {
      if (!item || typeof item !== "object") return false;
      const account = item as Partial<DemoAccount>;
      return (
        typeof account.name === "string" &&
        typeof account.email === "string" &&
        typeof account.password === "string" &&
        typeof account.role === "string"
      );
    });
  } catch (error) {
    console.warn("Unable to read saved accounts.", error);
    return [];
  }
}

function findAccount(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return [...DEMO_ACCOUNTS, ...readAccounts()].find(
    (account) => account.email.toLowerCase() === normalized,
  );
}

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
      const account = findAccount(email);

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

  const register = useCallback(
    (name: string, email: string, password: string): string | null => {
      if (findAccount(email)) {
        return "An account with this email already exists";
      }

      const account: DemoAccount = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "Sales Staff",
      };

      try {
        localStorage.setItem(
          ACCOUNTS_KEY,
          JSON.stringify([...readAccounts(), account]),
        );
      } catch (error) {
        console.warn("Unable to create account.", error);
        return "Unable to create account. Please try again.";
      }

      const session: AuthUser = {
        name: account.name,
        email: account.email,
        role: account.role,
      };

      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(SESSION_KEY);
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
