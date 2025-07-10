"use client";

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { CitationData } from "@/lib/statistics";

interface CitationsLineChartProps {
  data: CitationData[];
}

export function CitationsLineChart({ data }: CitationsLineChartProps) {
  const LINE_STROKE_COLOR = "hsl(var(--chart-1))";
  const GRID_STROKE_COLOR = "hsl(var(--border))";
  const AXIS_STROKE_COLOR = "hsl(var(--foreground))";

  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">Data sitasi tidak tersedia.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE_COLOR} />
        <XAxis dataKey="month" stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
        <YAxis stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="citations" stroke={LINE_STROKE_COLOR} activeDot={{ r: 8 }} name="Jumlah Sitasi" />
      </LineChart>
    </ResponsiveContainer>
  );
}