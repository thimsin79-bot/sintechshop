import type { ShopData } from "./types";
import { formatCurrency } from "./utils";

export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  taxId: string;
  currency: string;
  logo: string;
}

export interface ActivityEntry {
  id: string;
  icon: string;
  color: string;
  title: string;
  detail: string;
}

const COMPANY_KEY = "sintech.company.v1";
const ACTIVITY_KEY = "sintech.activity.v1";
const MAX_ACTIVITY = 25;

export const CURRENCIES = ["USD", "EUR", "GBP", "THB", "JPY", "AUD"] as const;

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "SINTech",
  email: "hello@sintech.com",
  phone: "+1 555-0100",
  website: "https://sintech.example",
  address: "123 Tech Street, San Francisco, CA",
  taxId: "",
  currency: "USD",
  logo: "",
};

export function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem(COMPANY_KEY);
    if (!raw) return { ...DEFAULT_COMPANY_PROFILE };
    const parsed = JSON.parse(raw) as Partial<CompanyProfile>;
    return {
      name:
        typeof parsed.name === "string"
          ? parsed.name
          : DEFAULT_COMPANY_PROFILE.name,
      email:
        typeof parsed.email === "string"
          ? parsed.email
          : DEFAULT_COMPANY_PROFILE.email,
      phone:
        typeof parsed.phone === "string"
          ? parsed.phone
          : DEFAULT_COMPANY_PROFILE.phone,
      website:
        typeof parsed.website === "string"
          ? parsed.website
          : DEFAULT_COMPANY_PROFILE.website,
      address:
        typeof parsed.address === "string"
          ? parsed.address
          : DEFAULT_COMPANY_PROFILE.address,
      taxId:
        typeof parsed.taxId === "string"
          ? parsed.taxId
          : DEFAULT_COMPANY_PROFILE.taxId,
      currency:
        typeof parsed.currency === "string"
          ? parsed.currency
          : DEFAULT_COMPANY_PROFILE.currency,
      logo:
        typeof parsed.logo === "string"
          ? parsed.logo
          : DEFAULT_COMPANY_PROFILE.logo,
    };
  } catch (error) {
    console.warn("Unable to load company profile.", error);
    return { ...DEFAULT_COMPANY_PROFILE };
  }
}

export function saveCompanyProfile(profile: CompanyProfile): boolean {
  try {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.warn("Unable to save company profile.", error);
    return false;
  }
}

function isActivityEntry(value: unknown): value is ActivityEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<ActivityEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.icon === "string" &&
    typeof entry.color === "string" &&
    typeof entry.title === "string" &&
    typeof entry.detail === "string"
  );
}

export function loadActivityEntries(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isActivityEntry) : [];
  } catch (error) {
    console.warn("Unable to load activity log.", error);
    return [];
  }
}

export function recordActivity(
  entry: Omit<ActivityEntry, "id">,
): ActivityEntry {
  const item: ActivityEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };

  try {
    localStorage.setItem(
      ACTIVITY_KEY,
      JSON.stringify([item, ...loadActivityEntries()].slice(0, MAX_ACTIVITY)),
    );
  } catch (error) {
    console.warn("Unable to save activity log.", error);
  }

  return item;
}

export function buildActivityLog(data: ShopData): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  data.sales.forEach((sale) => {
    entries.push({
      id: `sale-${sale.id}`,
      icon: "fa-receipt",
      color:
        sale.status === "completed"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-rose-50 text-rose-600",
      title: `Invoice ${sale.id} ${sale.status}`,
      detail: `${sale.customer} · ${formatCurrency(sale.total)}`,
    });
  });

  data.purchases.forEach((purchase) => {
    entries.push({
      id: `purchase-${purchase.id}`,
      icon: "fa-shopping-cart",
      color:
        purchase.status === "received"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-blue-50 text-blue-600",
      title: `Purchase ${purchase.id} ${purchase.status}`,
      detail: `${purchase.supplier} · ${formatCurrency(purchase.total)}`,
    });
  });

  data.stockMovements.forEach((movement) => {
    entries.push({
      id: `movement-${movement.id}`,
      icon: movement.type === "in" ? "fa-arrow-down" : "fa-arrow-up",
      color:
        movement.type === "in"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-rose-50 text-rose-600",
      title: `Stock ${movement.type} · ${movement.product}`,
      detail: `${movement.type === "in" ? "+" : "-"}${movement.qty} · ${movement.ref}`,
    });
  });

  data.warranties.forEach((warranty) => {
    entries.push({
      id: `warranty-${warranty.id}`,
      icon: "fa-shield-alt",
      color:
        warranty.status === "active"
          ? "bg-amber-50 text-amber-600"
          : "bg-rose-50 text-rose-600",
      title: `Warranty ${warranty.id} ${warranty.status}`,
      detail: `${warranty.product} · ${warranty.customer}`,
    });
  });

  return entries;
}
