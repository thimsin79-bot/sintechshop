"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ShopData } from "@/lib/types";

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#dc2626",
  "#64748b",
  "#0891b2",
  "#c026d3",
];

export function CategoryChart({
  sales,
  products,
}: {
  sales: ShopData["sales"];
  products: ShopData["products"];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasCompletedSales = sales.some((sale) => sale.status === "completed");

  useEffect(() => {
    if (!canvasRef.current) return;

    const productMap = new Map(products.map((product) => [product.id, product]));
    const totals = new Map<string, number>();

    sales
      .filter((sale) => sale.status === "completed")
      .forEach((sale) => {
        const category =
          (sale.productId != null
            ? productMap.get(sale.productId)?.category
            : undefined) ?? "Uncategorized";
        totals.set(category, (totals.get(category) ?? 0) + sale.total);
      });

    const labels = [...totals.keys()];
    if (!labels.length) return;

    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: labels.map((label) => totals.get(label) ?? 0),
            backgroundColor: labels.map(
              (_, index) => COLORS[index % COLORS.length],
            ),
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, padding: 15 } },
        },
        cutout: "65%",
      },
    });

    return () => chart.destroy();
  }, [sales, products]);

  if (!hasCompletedSales) {
    return (
      <div className="relative h-72 flex items-center justify-center text-sm text-slate-500">
        No completed sales yet
      </div>
    );
  }

  return (
    <div className="relative h-72">
      <canvas ref={canvasRef} />
    </div>
  );
}
