"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function SalesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Sales ($)",
            data: [1200, 1900, 1500, 2800, 2200, 3100, 2450],
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
  }, []);

  return (
    <div className="relative h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
