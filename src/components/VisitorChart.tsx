"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyVisits, DailyVisitData } from "@/lib/analytics";
import { Loader2 } from "lucide-react";
import { logError, logChartRender } from "@/lib/debug";

// Create a wrapper component that dynamically imports recharts
function RechartsWrapper({ data }: { data: DailyVisitData[] }) {
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecharts = async () => {
      try {
        const recharts = await import("recharts");
        setRechartsComponents(recharts);
        logChartRender("VisitorChart", data);
      } catch (error) {
        logError(error, "RechartsWrapper");
        console.error("Failed to load recharts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecharts();
  }, [data]);

  if (loading || !RechartsComponents) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
        <p className="ml-2 text-sm text-sidebar-foreground">Memuat grafik...</p>
      </div>
    );
  }

  const {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  } = RechartsComponents;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--sidebar-border))"
        />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--sidebar-foreground))"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          stroke="hsl(var(--sidebar-foreground))"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--sidebar-accent))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--sidebar-background))",
            borderColor: "hsl(var(--sidebar-border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--sidebar-foreground))",
            fontSize: "12px",
          }}
          labelStyle={{ color: "hsl(var(--sidebar-primary))" }}
        />
        <Bar
          dataKey="visitors"
          fill="hsl(var(--sidebar-primary))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function VisitorChartContent() {
  const [data, setData] = useState<DailyVisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[VisitorChart] Fetching visitor data...");
        const dailyData = await getDailyVisits(7);
        console.log("[VisitorChart] Data received:", dailyData);
        setData(dailyData);
      } catch (err) {
        logError(err, "VisitorChartContent");
        console.error("Error fetching visitor data:", err);
        setError("Gagal memuat data pengunjung");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
        <p className="ml-2 text-sm text-sidebar-foreground">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-center text-sm text-muted-foreground">
          Tidak ada data kunjungan.
        </p>
      </div>
    );
  }

  return <RechartsWrapper data={data} />;
}

export function VisitorChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary">
            VISITORS (Mingguan)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[150px] p-2">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
            <p className="ml-2 text-sm text-sidebar-foreground">Memuat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-sidebar-primary">
          VISITORS (Mingguan)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[150px] p-2">
        <VisitorChartContent />
      </CardContent>
    </Card>
  );
}
