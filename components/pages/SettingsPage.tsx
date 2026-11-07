"use client";

import { useEffect, useMemo, useState } from "react";
import { FormError } from "@/components/forms/FormError";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import {
  CURRENCIES,
  DEFAULT_COMPANY_PROFILE,
  buildActivityLog,
  loadActivityEntries,
  loadCompanyProfile,
  recordActivity,
  saveCompanyProfile,
  type ActivityEntry,
  type CompanyProfile,
} from "@/lib/settings";
import {
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from "@/lib/styles";
import { formatDate } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SettingsPage() {
  const { data } = useData();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [logged, setLogged] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(loadCompanyProfile());
    setLogged(loadActivityEntries());
  }, []);

  const activity = useMemo(
    () =>
      [...logged, ...buildActivityLog(data)]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 12),
    [logged, data],
  );

  function update<K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile.name.trim()) {
      setError("Company name is required");
      return;
    }
    if (profile.email && !EMAIL_PATTERN.test(profile.email.trim())) {
      setError("Company email is not valid");
      return;
    }
    if (!saveCompanyProfile(profile)) {
      setError("Unable to save the company profile. Please try again.");
      return;
    }

    recordActivity({
      icon: "fa-building",
      color: "bg-brand-50 text-brand-600",
      title: "Company profile updated",
      detail: profile.name,
    });
    setLogged(loadActivityEntries());
    setError(null);
    showToast("Company profile saved");
  }

  function handleReset() {
    const restored = { ...DEFAULT_COMPANY_PROFILE };
    setProfile(restored);
    setError(null);
    saveCompanyProfile(restored);
    recordActivity({
      icon: "fa-rotate-left",
      color: "bg-slate-100 text-slate-600",
      title: "Company profile reset",
      detail: restored.name,
    });
    setLogged(loadActivityEntries());
    showToast("Company profile reset to defaults");
  }

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800">Company Profile</h3>
              <p className="text-xs text-slate-500">
                Manage your business details used across the system
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <i className="fas fa-building" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="company-name" className={labelClass}>
                Company name <span className="text-rose-500">*</span>
              </label>
              <input
                id="company-name"
                value={profile.name}
                onChange={(event) => update("name", event.target.value)}
                className={inputClass}
                placeholder="Your company name"
              />
            </div>

            <div>
              <label htmlFor="company-email" className={labelClass}>
                Email
              </label>
              <input
                id="company-email"
                type="email"
                value={profile.email}
                onChange={(event) => update("email", event.target.value)}
                className={inputClass}
                placeholder="hello@company.com"
              />
            </div>

            <div>
              <label htmlFor="company-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="company-phone"
                value={profile.phone}
                onChange={(event) => update("phone", event.target.value)}
                className={inputClass}
                placeholder="+1 555-0100"
              />
            </div>

            <div>
              <label htmlFor="company-website" className={labelClass}>
                Website
              </label>
              <input
                id="company-website"
                value={profile.website}
                onChange={(event) => update("website", event.target.value)}
                className={inputClass}
                placeholder="https://company.com"
              />
            </div>

            <div>
              <label htmlFor="company-tax" className={labelClass}>
                Tax ID
              </label>
              <input
                id="company-tax"
                value={profile.taxId}
                onChange={(event) => update("taxId", event.target.value)}
                className={inputClass}
                placeholder="VAT / Tax number"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="company-address" className={labelClass}>
                Address
              </label>
              <textarea
                id="company-address"
                rows={2}
                value={profile.address}
                onChange={(event) => update("address", event.target.value)}
                className={inputClass}
                placeholder="Street, city, country"
              />
            </div>

            <div>
              <label htmlFor="company-currency" className={labelClass}>
                Currency
              </label>
              <select
                id="company-currency"
                value={profile.currency}
                onChange={(event) => update("currency", event.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormError message={error} />

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={handleReset} className={secondaryButton}>
              <i className="fas fa-rotate-left" /> Reset
            </button>
            <button type="submit" className={primaryButton}>
              <i className="fas fa-save" /> Save Profile
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Activity Log</h3>
              <p className="text-xs text-slate-500">Recent shop activity</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <i className="fas fa-clock-rotate-left" />
            </div>
          </div>

          <div className="space-y-3">
            {activity.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-lg ${entry.color} flex items-center justify-center flex-shrink-0`}
                >
                  <i className={`fas ${entry.icon} text-sm`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {entry.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {entry.detail}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(entry.date)}
                  </p>
                </div>
              </div>
            ))}
            {!activity.length ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
