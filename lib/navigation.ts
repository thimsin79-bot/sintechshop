export type PageKey =
  | "dashboard"
  | "products"
  | "categories"
  | "inventory"
  | "suppliers"
  | "purchasing"
  | "sales"
  | "customers"
  | "warranty"
  | "reports"
  | "users"
  | "settings";

export interface NavItem {
  key: PageKey;
  label: string;
  href: string;
  icon: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { key: "dashboard", label: "Dashboard", href: "/", icon: "fa-chart-pie" },
      { key: "products", label: "Products", href: "/products", icon: "fa-box" },
      { key: "categories", label: "Categories", href: "/categories", icon: "fa-tags" },
      { key: "inventory", label: "Stock In / Out", href: "/inventory", icon: "fa-warehouse" },
    ],
  },
  {
    label: "Procurement",
    items: [
      { key: "suppliers", label: "Suppliers", href: "/suppliers", icon: "fa-truck" },
      { key: "purchasing", label: "Purchasing", href: "/purchasing", icon: "fa-shopping-cart" },
    ],
  },
  {
    label: "Sales",
    items: [
      { key: "sales", label: "Sales", href: "/sales", icon: "fa-receipt" },
      { key: "customers", label: "Customers", href: "/customers", icon: "fa-users" },
      { key: "warranty", label: "Warranty", href: "/warranty", icon: "fa-shield-alt" },
    ],
  },
  {
    label: "System",
    items: [
      { key: "reports", label: "Reports", href: "/reports", icon: "fa-chart-bar" },
      { key: "users", label: "User Management", href: "/users", icon: "fa-user-cog" },
      { key: "settings", label: "Settings", href: "/settings", icon: "fa-gear" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export const PAGE_META: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your computer shop" },
  products: { title: "Products", subtitle: "Manage product catalog & pricing" },
  categories: { title: "Categories", subtitle: "Organize products by category" },
  inventory: { title: "Stock In / Out", subtitle: "Track inventory movements" },
  suppliers: { title: "Suppliers", subtitle: "Manage vendor relationships" },
  purchasing: { title: "Purchasing", subtitle: "Purchase orders & receiving" },
  sales: { title: "Sales", subtitle: "Invoices and transactions" },
  customers: { title: "Customers", subtitle: "Customer database & history" },
  warranty: { title: "Warranty Tracking", subtitle: "Serial numbers & claims" },
  reports: { title: "Reports", subtitle: "Analytics and exports" },
  users: { title: "User Management", subtitle: "Roles and access control" },
  settings: { title: "Settings", subtitle: "Company profile and activity log" },
};

export function pageKeyForPath(pathname: string): PageKey {
  const item = NAV_ITEMS.find((navItem) => navItem.href === pathname);
  return item ? item.key : "dashboard";
}
