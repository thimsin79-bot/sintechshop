"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_COMPANY_PROFILE,
  loadCompanyProfile,
  saveCompanyProfile,
  type CompanyProfile,
} from "./settings";

interface CompanyContextValue {
  profile: CompanyProfile;
  ready: boolean;
  saveProfile: (profile: CompanyProfile) => boolean;
  resetProfile: () => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CompanyProfile>(
    DEFAULT_COMPANY_PROFILE,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadCompanyProfile());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.title = `${profile.name} • Computer Shop Inventory`;
  }, [profile, ready]);

  const saveProfile = useCallback((next: CompanyProfile): boolean => {
    if (!saveCompanyProfile(next)) return false;
    setProfile(next);
    return true;
  }, []);

  const resetProfile = useCallback(() => {
    const restored = { ...DEFAULT_COMPANY_PROFILE };
    saveCompanyProfile(restored);
    setProfile(restored);
  }, []);

  return (
    <CompanyContext.Provider value={{ profile, ready, saveProfile, resetProfile }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used inside a CompanyProvider");
  }
  return context;
}
