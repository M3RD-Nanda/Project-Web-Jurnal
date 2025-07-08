"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Data dummy untuk grafik pengunjung
const data = [
  { name: "Sen", visitors: 400 },
  { name: "Sel", visitors: 300 },
  { name: "Rab", visitors: 500 },
  { name: "Kam", visitors: 450 },
  { name: "Jum", visitors: 600 },
  { name: "Sab", visitors: 750 },
  { name: "Min", visitors: 800 },
];

export function VisitorChart() {
  return (
    <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-sidebar-primary">VISITORS (Mingguan)</CardTitle>
      </CardHeader>
      <CardContent className="h-[150px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--sidebar-border))" />
            <XAxis dataKey="name" stroke="hsl(var(--sidebar-foreground))" tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--sidebar-foreground))" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--sidebar-accent))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--sidebar-background))",
                borderColor: "hsl(var(--sidebar-border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--sidebar-foreground))",
              }}
              labelStyle={{ color: "hsl(var(--sidebar-primary))" }}
            />
            <Bar dataKey="visitors" fill="hsl(var(--sidebar-primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}