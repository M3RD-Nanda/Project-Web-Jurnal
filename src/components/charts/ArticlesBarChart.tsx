"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ArticlesPerYearData } from "@/lib/statistics";

interface ArticlesBarChartProps {
  data: ArticlesPerYearData[];
}

export function ArticlesBarChart({ data }: ArticlesBarChartProps) {
  const BAR_FILL_COLOR = "hsl(var(--primary))";
  const GRID_STROKE_COLOR = "hsl(var(--border))";
  const AXIS_STROKE_COLOR = "hsl(var(--foreground))";

  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">
        Data artikel per tahun tidak tersedia.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE_COLOR} />
        <XAxis
          dataKey="year"
          stroke={AXIS_STROKE_COLOR}
          tick={{ fill: AXIS_STROKE_COLOR }}
        />
        <YAxis stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="articles" fill={BAR_FILL_COLOR} name="Jumlah Artikel" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ArticlesBarChart;
