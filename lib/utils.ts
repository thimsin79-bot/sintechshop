export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function initials(name: string): string {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function addMonths(dateValue: string, months: number): string {
  const date = new Date(dateValue || todayISO());
  if (Number.isNaN(date.getTime())) return todayISO();
  const day = date.getDate();
  date.setMonth(date.getMonth() + Number(months || 0));
  if (date.getDate() < day) date.setDate(0);
  return date.toISOString().slice(0, 10);
}

export function cloneData<T>(value: T): T {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

export function nextId(collection: { id: number | string }[]): number {
  return collection.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export function nextCode(
  prefix: string,
  collection: { id: number | string }[],
  pad = 0,
): string {
  let max = 0;
  collection.forEach((item) => {
    const parts = String(item.id).split("-");
    const last = Number(parts[parts.length - 1]);
    if (!Number.isNaN(last)) max = Math.max(max, last);
  });
  const next = max + 1;
  return prefix + (pad ? String(next).padStart(pad, "0") : next);
}

export function nextPurchaseId(purchases: { id: string }[]): string {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  let max = 0;
  purchases.forEach((item) => {
    if (String(item.id).startsWith(prefix)) {
      const last = Number(String(item.id).slice(prefix.length));
      if (!Number.isNaN(last)) max = Math.max(max, last);
    }
  });
  return prefix + String(max + 1).padStart(3, "0");
}

export function exportCsv(collection: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return false;
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(",")),
  ].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `techvault-${collection}-${todayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
