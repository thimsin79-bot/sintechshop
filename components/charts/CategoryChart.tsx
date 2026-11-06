"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export function CategoryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: ["GPUs", "CPUs", "Storage", "Memory", "Motherboards", "Others"],
        datasets: [
          {
            data: [35, 22, 15, 12, 8, 8],
            backgroundColor: [
              "#2563eb",
              "#7c3aed",
              "#059669",
              "#d97706",
              "#dc2626",
              "#64748b",
            ],
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
  }, []);

  return (
    <div className="relative h-72">
      <canvas ref={canvasRef} />
    </div>
  );
}
