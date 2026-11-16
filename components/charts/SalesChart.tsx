"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ShopData } from "@/lib/types";

export function SalesChart({ sales }: { sales: ShopData["sales"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasCompletedSales = sales.some((sale) => sale.status === "completed");

  useEffect(() => {
    if (!canvasRef.current) return;

    const recent = sales
      .filter((sale) => sale.status === "completed")
      .slice(0, 7)
      .reverse();

    if (!recent.length) return;

    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: recent.map((sale) => sale.id),
        datasets: [
          {
            label: "Sales ($)",
            data: recent.map((sale) => sale.total),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.08)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#2563eb",
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#f1f5f9" },
            ticks: { callback: (value) => "$" + value },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => chart.destroy();
  }, [sales]);

  if (!hasCompletedSales) {
    return (
      <div className="relative h-64 flex items-center justify-center text-sm text-slate-500">
        No completed sales yet
      </div>
    );
  }

  return (
    <div className="relative h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
