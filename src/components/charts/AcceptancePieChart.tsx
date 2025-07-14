"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { AcceptanceRateData } from "@/lib/statistics";

interface AcceptancePieChartProps {
  data: AcceptanceRateData[];
}

export function AcceptancePieChart({ data }: AcceptancePieChartProps) {
  const PIE_COLOR_1 = "hsl(var(--chart-2))";
  const PIE_COLOR_2 = "hsl(var(--chart-3))";
  const PIE_COLORS = [PIE_COLOR_1, PIE_COLOR_2];

  const totalAcceptedRejected = data.reduce((sum, item) => sum + item.count, 0);
  const pieChartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    percent: totalAcceptedRejected > 0 ? item.count / totalAcceptedRejected : 0,
  }));

  if (pieChartData.length === 0 || totalAcceptedRejected === 0) {
    return (
      <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">
        Data tingkat penerimaan tidak tersedia.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieChartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={80} // Disesuaikan untuk lebih banyak ruang
          innerRadius={60} // Ditambahkan untuk membuat grafik donat
          dataKey="value"
          nameKey="name"
          label={({ name, percent }: { name: string; percent: number }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {pieChartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default AcceptancePieChart;
