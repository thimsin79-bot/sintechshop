"use client";

import { CategoryChart } from "@/components/charts/CategoryChart";
import { useData } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { secondaryButton } from "@/lib/styles";
import { exportCsv, formatCurrency } from "@/lib/utils";

type ReportKey = "sales" | "products" | "purchases" | "warranties";

export function ReportsPage() {
  const { data } = useData();
  const { showToast } = useToast();

  const completed = data.sales.filter((sale) => sale.status === "completed");
  const productMap = new Map(
    data.products.map((product) => [product.id, product]),
  );
  const unitsSold = completed.reduce((sum, sale) => sum + sale.items, 0);
  const revenue = completed.reduce((sum, sale) => sum + sale.total, 0);
  const avgOrder = completed.length ? revenue / completed.length : 0;
  const grossProfit = completed.reduce((sum, sale) => {
    const cost =
      sale.productId != null
        ? (productMap.get(sale.productId)?.cost ?? 0) * sale.items
        : 0;
    return sum + sale.total - cost;
  }, 0);
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const productTotals = new Map<
    string,
    { name: string; sold: number; revenue: number }
  >();
  completed.forEach((sale) => {
    const key = String(sale.productId ?? "deleted");
    const current = productTotals.get(key) ?? {
      name:
        sale.productId != null
          ? (productMap.get(sale.productId)?.name ?? sale.productName ?? sale.product ?? "Deleted product")
          : (sale.productName || sale.product || "Deleted product"),
      sold: 0,
      revenue: 0,
    };
    current.sold += sale.items;
    current.revenue += sale.total;
    productTotals.set(key, current);
  });
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

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
          <p className="text-xs text-slate-500 mt-1">
            Margin {margin.toFixed(1)}% · revenue minus unit cost
          </p>
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
          <CategoryChart sales={data.sales} products={data.products} />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.length ? (
              topProducts.map((product, index) => (
                <div key={`${product.name}-${index}`} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.sold} units
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No completed sales yet</p>
            )}
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
