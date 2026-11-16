"use client";

import { CategoryChart } from "@/components/charts/CategoryChart";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { secondaryButton } from "@/lib/styles";
import { exportCsv, formatCurrency } from "@/lib/utils";

const topProducts = [
  { name: "NVIDIA RTX 4090 24GB", sold: 8, revenue: 12792 },
  { name: "AMD Ryzen 9 7950X", sold: 11, revenue: 6039 },
  { name: "Samsung 990 PRO 2TB", sold: 14, revenue: 2646 },
  { name: "Corsair Vengeance 32GB", sold: 18, revenue: 2322 },
  { name: "ASUS ROG Strix X670E-E", sold: 5, revenue: 2495 },
];

type ReportKey = "sales" | "products" | "purchases" | "warranties";

export function ReportsPage() {
  const { data } = useData();
  const { showToast } = useToast();

  const completed = data.sales.filter((sale) => sale.status === "completed");
  const unitsSold = completed.reduce((sum, sale) => sum + sale.items, 0);
  const avgOrder = completed.length
    ? completed.reduce((sum, sale) => sum + sale.total, 0) / completed.length
    : 0;
  const grossProfit =
    completed.reduce((sum, sale) => sum + sale.total, 0) * 0.28;

  function handleExport(key: ReportKey, label: string) {
    const rows = data[key] as unknown as Record<string, unknown>[];
    if (!exportCsv(key, rows)) {
      showToast(`No ${label.toLowerCase()} to export`);
      return;
    }
    showToast(`${label} exported`);
  }

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Gross Profit</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {formatCurrency(grossProfit)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Margin ~28%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Units Sold</p>
          <p className="text-2xl font-bold mt-1">{unitsSold}</p>
          <p className="text-xs text-emerald-600 mt-1">
            <i className="fas fa-arrow-up" /> Across completed invoices
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500">Avg. Order Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(avgOrder)}</p>
          <p className="text-xs text-slate-500 mt-1">Retail + Wholesale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold mb-4">Sales by Category</h3>
          <CategoryChart />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.sold} units</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-semibold mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleExport("sales", "Sales report")}
            className={secondaryButton}
          >
            <i className="fas fa-file-excel text-emerald-600" /> Sales Report
          </button>
          <button
            type="button"
            onClick={() => handleExport("products", "Inventory report")}
            className={secondaryButton}
          >
            <i className="fas fa-file-excel text-emerald-600" /> Inventory Report
          </button>
          <button
            type="button"
            onClick={() => handleExport("purchases", "Purchase report")}
            className={secondaryButton}
          >
            <i className="fas fa-file-excel text-emerald-600" /> Purchase Report
          </button>
          <button
            type="button"
            onClick={() => handleExport("warranties", "Warranty report")}
            className={secondaryButton}
          >
            <i className="fas fa-file-pdf text-rose-600" /> Warranty Report
          </button>
        </div>
      </div>
    </div>
  );
}
