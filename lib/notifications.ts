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

const STORAGE_KEY = "sintech.notifications.v1";

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

  return items.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
}
