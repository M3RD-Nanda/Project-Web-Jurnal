"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyVisits, DailyVisitData } from "@/lib/analytics"; // Import the new analytics function
import { Loader2 } from "lucide-react";

export function VisitorChart() {
  const [data, setData] = useState<DailyVisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Add mounted state

  useEffect(() => {
    setMounted(true); // Set mounted to true after initial render on client
    const fetchVisits = async () => {
      setLoading(true);
      const dailyData = await getDailyVisits(7); // Fetch data for the last 7 days
      setData(dailyData);
      setLoading(false);
    };
    fetchVisits();
  }, []);

  return (
    <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-sidebar-primary">VISITORS (Mingguan)</CardTitle>
      </CardHeader>
      <CardContent className="h-[150px] p-2">
        <ResponsiveContainer width="100%" height="100%" key={mounted ? "visitor-chart-mounted" : "visitor-chart-unmounted"}>
          {mounted && data.length > 0 ? (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--sidebar-border))" />
              <XAxis dataKey="date" stroke="hsl(var(--sidebar-foreground))" tickLine={false} axisLine={false} />
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
          ) : mounted ? (
            <p className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">Tidak ada data kunjungan.</p>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
              <p className="ml-2 text-sm text-sidebar-foreground">Memuat data...</p>
            </div>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}