import type { ShopData } from "./types";

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  href: string;
  icon: string;
  tone: "danger" | "warning" | "info";
  order: number;
}

export interface NotificationState {
  read: string[];
  dismissed: string[];
}

const STORAGE_KEY = "techvault.notifications.v1";

export const EMPTY_NOTIFICATION_STATE: NotificationState = {
  read: [],
  dismissed: [],
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function loadNotificationState(): NotificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_NOTIFICATION_STATE };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      read: isStringArray(parsed.read) ? parsed.read : [],
      dismissed: isStringArray(parsed.dismissed) ? parsed.dismissed : [],
    };
  } catch (error) {
    console.warn("Unable to load notification state.", error);
    return { ...EMPTY_NOTIFICATION_STATE };
  }
}

export function saveNotificationState(state: NotificationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to persist notification state.", error);
  }
}

function daysUntil(value: string): number | null {
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function buildNotifications(data: ShopData): AppNotification[] {
  const items: AppNotification[] = [];

  data.products.forEach((product) => {
    if (product.stock <= 0) {
      items.push({
        id: `stock-out-${product.id}`,
        title: `Out of stock: ${product.name}`,
        detail: `${product.sku} · Reorder now`,
        href: "/inventory",
        icon: "fa-times-circle",
        tone: "danger",
        order: 0,
      });
      return;
    }
    if (product.status === "low") {
      items.push({
        id: `stock-low-${product.id}`,
        title: `Low stock: ${product.name}`,
        detail: `${product.stock} left · minimum ${product.minStock}`,
        href: "/inventory",
        icon: "fa-exclamation-triangle",
        tone: "warning",
        order: 2,
      });
    }
  });

  data.purchases.forEach((purchase) => {
    if (purchase.status === "received") return;
    items.push({
      id: `purchase-${purchase.id}`,
      title: `Purchase ${purchase.id} awaiting receipt`,
      detail: `${purchase.supplier} · ${purchase.items} items`,
      href: "/purchasing",
      icon: "fa-truck",
      tone: "info",
      order: 3,
    });
  });

  data.warranties.forEach((warranty) => {
    if (warranty.status !== "active") return;
    const days = daysUntil(warranty.expiry);
    if (days === null || days > 30) return;
    const expired = days < 0;
    items.push({
      id: `warranty-${warranty.id}`,
      title: expired
        ? `Warranty expired: ${warranty.product}`
        : `Warranty expiring: ${warranty.product}`,
      detail: `${warranty.customer} · ${
        expired ? `${Math.abs(days)} days overdue` : `${days} days left`
      }`,
      href: "/warranty",
      icon: "fa-shield-alt",
      tone: expired ? "danger" : "warning",
      order: expired ? 1 : 4,
    });
  });

  return items.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
}
