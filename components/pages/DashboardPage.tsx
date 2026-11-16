"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SalesChart } from "@/components/charts/SalesChart";
import { useData } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface SearchResult {
  type: string;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  href: string;
}

export function DashboardPage() {
  const { data } = useData();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalProducts = data.products.length;
  const lowStockProducts = data.products.filter(
    (product) => product.stock <= product.minStock,
  );
  const totalSales = data.sales
    .filter((sale) => sale.status === "completed")
    .reduce((sum, sale) => sum + sale.total, 0);
  const totalStockValue = data.products.reduce(
    (sum, product) => sum + product.stock * product.cost,
    0,
  );

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const found: SearchResult[] = [];

    data.products.forEach((product) => {
      if (
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q)
      ) {
        found.push({
          type: "Product",
          icon: "fa-box",
          color: "bg-brand-50 text-brand-600",
          title: product.name,
          subtitle: `${product.sku} · Stock: ${product.stock} · ${formatCurrency(product.price)}`,
          href: "/products",
        });
      }
    });

    data.customers.forEach((customer) => {
      if (
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.phone.includes(q)
      ) {
        found.push({
          type: "Customer",
          icon: "fa-user",
          color: "bg-violet-50 text-violet-600",
          title: customer.name,
          subtitle: `${customer.email} · ${customer.orders} orders · ${formatCurrency(customer.spent)}`,
          href: "/customers",
        });
      }
    });

    data.sales.forEach((sale) => {
      if (
        sale.id.toLowerCase().includes(q) ||
        sale.customer.toLowerCase().includes(q)
      ) {
        found.push({
          type: "Invoice",
          icon: "fa-receipt",
          color: "bg-emerald-50 text-emerald-600",
          title: sale.id,
          subtitle: `${sale.customer} · ${formatCurrency(sale.total)} · ${sale.status}`,
          href: "/sales",
        });
      }
    });

    data.warranties.forEach((warranty) => {
      if (
        warranty.id.toLowerCase().includes(q) ||
        warranty.serial.toLowerCase().includes(q) ||
        warranty.product.toLowerCase().includes(q) ||
        warranty.customer.toLowerCase().includes(q)
      ) {
        found.push({
          type: "Warranty",
          icon: "fa-shield-alt",
          color: "bg-amber-50 text-amber-600",
          title: warranty.id,
          subtitle: `${warranty.product} · ${warranty.serial} · ${warranty.status}`,
          href: "/warranty",
        });
      }
    });

    data.purchases.forEach((purchase) => {
      if (
        purchase.id.toLowerCase().includes(q) ||
        purchase.supplier.toLowerCase().includes(q)
      ) {
        found.push({
          type: "Purchase Order",
          icon: "fa-shopping-cart",
          color: "bg-blue-50 text-blue-600",
          title: purchase.id,
          subtitle: `${purchase.supplier} · ${formatCurrency(purchase.total)} · ${purchase.status}`,
          href: "/purchasing",
        });
      }
    });

    return found;
  }, [data, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const visibleResults = results.slice(0, 10);
  const showResults = searchOpen && query.trim().length > 0;

  return (
    <div className="fade-in space-y-6">
      <div className="relative" ref={searchBoxRef}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition">
          <div className="pl-3 text-slate-400">
            <i className="fas fa-search" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search products, SKUs, customers, invoices, warranties..."
            className="flex-1 py-2.5 px-2 text-sm bg-transparent focus:outline-none placeholder:text-slate-400"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200 mr-1">
            ⌘K
          </kbd>
        </div>

        {showResults ? (
          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-80 overflow-y-auto">
            {visibleResults.length ? (
              visibleResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.title}-${index}`}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(result.href);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition border-b border-slate-50 last:border-0"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${result.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <i className={`fas ${result.icon} text-sm`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {result.title}
                      </span>
                      <span className="badge bg-slate-100 text-slate-500 flex-shrink-0">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {result.subtitle}
                    </p>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 text-xs" />
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                <i className="fas fa-search text-2xl mb-2 opacity-40" />
                <p>No results for “{query}”</p>
              </div>
            )}
            {results.length > 10 ? (
              <div className="px-4 py-2.5 text-xs text-slate-500 bg-slate-50 text-center">
                +{results.length - 10} more results
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Total Products"
          value={String(totalProducts)}
          note="In catalog"
          noteClass="text-emerald-600"
          icon="fa-box"
          iconClass="bg-brand-50 text-brand-600"
        />
        <StatCard
          label="Low Stock Alerts"
          value={String(lowStockProducts.length)}
          note="Needs restocking"
          valueClass="text-amber-600"
          icon="fa-exclamation-triangle"
          iconClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Total Sales"
          value={formatCurrency(totalSales)}
          note="Completed invoices"
          noteClass="text-emerald-600"
          icon="fa-dollar-sign"
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(totalStockValue)}
          note="At cost price"
          icon="fa-warehouse"
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Sales Overview</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <SalesChart />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Low Stock Items</h3>
          <div className="space-y-3">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <span className="badge bg-amber-200 text-amber-800">
                    {product.stock} left
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">All stocks healthy</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Sales</h3>
            <button
              type="button"
              onClick={() => router.push("/sales")}
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-medium">Invoice</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.slice(0, 5).map((sale) => (
                  <tr
                    key={sale.id}
                    className="table-row border-b border-slate-50 cursor-pointer"
                    onClick={() => router.push("/sales")}
                  >
                    <td className="py-3 font-medium text-brand-600">
                      {sale.id}
                    </td>
                    <td className="py-3">{sale.customer}</td>
                    <td className="py-3">{formatCurrency(sale.total)}</td>
                    <td className="py-3">
                      <span
                        className={`badge ${
                          sale.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!data.sales.length ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-slate-500"
                    >
                      No sales yet
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">
              Recent Stock Movements
            </h3>
            <button
              type="button"
              onClick={() => router.push("/inventory")}
              className="text-xs text-brand-600 font-medium hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {data.stockMovements.slice(0, 5).map((movement) => (
              <div
                key={movement.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    movement.type === "in"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600"
                  }`}
                >
                  <i
                    className={`fas fa-arrow-${
                      movement.type === "in" ? "down" : "up"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {movement.product}
                  </p>
                  <p className="text-xs text-slate-500">{movement.ref}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    movement.type === "in"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {movement.type === "in" ? "+" : "-"}
                  {movement.qty}
                </span>
              </div>
            ))}
            {!data.stockMovements.length ? (
              <p className="text-sm text-slate-500">
                No stock movements yet
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  valueClass = "",
  noteClass = "text-slate-500",
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  note: string;
  valueClass?: string;
  noteClass?: string;
  icon: string;
  iconClass: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valueClass}`}>{value}</p>
          <p className={`text-xs mt-1 ${noteClass}`}>
            <i className="fas fa-arrow-up mr-1" />
            {note}
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconClass} flex items-center justify-center text-xl`}
        >
          <i className={`fas ${icon}`} />
        </div>
      </div>
    </div>
  );
}
