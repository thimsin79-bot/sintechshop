"use client";

import { useEffect, useMemo, useState } from "react";
import { FormError } from "@/components/forms/FormError";
import { useCompany } from "@/lib/company";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import {
  CURRENCIES,
  DEFAULT_COMPANY_PROFILE,
  buildActivityLog,
  loadActivityEntries,
  recordActivity,
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
  const { profile, saveProfile, resetProfile } = useCompany();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<CompanyProfile>(profile);
  const [logged, setLogged] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    setLogged(loadActivityEntries());
  }, []);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

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
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Please choose an image file");
      return;
    }
    if (file.size > 1024 * 1024) {
      setLogoError("Logo must be 1 MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("logo", reader.result);
        setLogoError(null);
      }
    };
    reader.onerror = () => setLogoError("Unable to read the selected file");
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed: CompanyProfile = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };

    if (!trimmed.name) {
      setError("Company name is required");
      return;
    }
    if (trimmed.email && !EMAIL_PATTERN.test(trimmed.email)) {
      setError("Company email is not valid");
      return;
    }
    if (!saveProfile(trimmed)) {
      setError("Unable to save the company profile. Please try again.");
      return;
    }

    recordActivity({
      icon: trimmed.logo !== profile.logo ? "fa-image" : "fa-building",
      color: "bg-brand-50 text-brand-600",
      title:
        trimmed.logo !== profile.logo
          ? "Company logo updated"
          : "Company profile updated",
      detail: trimmed.name,
    });
    setLogged(loadActivityEntries());
    setError(null);
    setLogoError(null);
    showToast("Company profile saved");
  }

  function handleReset() {
    resetProfile();
    setDraft({ ...DEFAULT_COMPANY_PROFILE });
    setError(null);
    setLogoError(null);
    recordActivity({
      icon: "fa-rotate-left",
      color: "bg-slate-100 text-slate-600",
      title: "Company profile reset",
      detail: DEFAULT_COMPANY_PROFILE.name,
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

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5 p-4 rounded-xl border border-slate-100 bg-slate-50/60">
            <div className="w-20 h-20 shrink-0 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
              {draft.logo ? (
                <img
                  src={draft.logo}
                  alt="Company logo preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <i className="fas fa-image text-2xl text-slate-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700">Company logo</p>
              <p className="text-xs text-slate-500">
                PNG, JPG, WebP or SVG up to 1 MB
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  htmlFor="company-logo"
                  className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium px-3 py-2 rounded-lg cursor-pointer transition"
                >
                  <i className="fas fa-upload" />
                  {draft.logo ? "Change logo" : "Upload logo"}
                </label>
                {draft.logo ? (
                  <button
                    type="button"
                    onClick={() => {
                      update("logo", "");
                      setLogoError(null);
                    }}
                    className="inline-flex items-center gap-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-sm font-medium px-3 py-2 rounded-lg transition"
                  >
                    <i className="fas fa-trash" /> Remove
                  </button>
                ) : null}
              </div>
              {logoError ? (
                <p role="alert" className="mt-2 text-xs text-rose-600">
                  {logoError}
                </p>
              ) : null}
            </div>
            <input
              id="company-logo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="company-name" className={labelClass}>
                Company name <span className="text-rose-500">*</span>
              </label>
              <input
                id="company-name"
                value={draft.name}
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
                value={draft.email}
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
                value={draft.phone}
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
                value={draft.website}
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
                value={draft.taxId}
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
                value={draft.address}
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
                value={draft.currency}
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
