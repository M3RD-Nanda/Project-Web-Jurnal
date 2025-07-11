"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDailyVisits,
  getVisitorStats,
  DailyVisitData,
  VisitorStats,
} from "@/lib/analytics";
import {
  Loader2,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
} from "lucide-react";
import { logError, logChartRender } from "@/lib/debug";
import { Badge } from "@/components/ui/badge";

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
      <BarChart data={data} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.8}
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.3}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="2 2"
          stroke="hsl(var(--border))"
          strokeOpacity={0.3}
        />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          fontWeight={500}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={30}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", fillOpacity: 0.1 }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--popover-foreground))",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid hsl(var(--border))",
          }}
          labelStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: "600",
            marginBottom: "4px",
          }}
          formatter={(value: any, name: any, props: any) => [
            `${value} pengunjung`,
            props.payload?.fullDate || name,
          ]}
        />
        <Bar
          dataKey="visitors"
          fill="url(#visitorGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={35}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function VisitorChartContent() {
  const [data, setData] = useState<DailyVisitData[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[VisitorChart] Fetching visitor data...");

        // Fetch both daily data and stats in parallel
        const [dailyData, visitorStats] = await Promise.all([
          getDailyVisits(7),
          getVisitorStats(),
        ]);

        console.log("[VisitorChart] Data received:", {
          dailyData,
          visitorStats,
        });
        setData(dailyData);
        setStats(visitorStats);
      } catch (err) {
        logError(err, "VisitorChartContent");
        console.error("Error fetching visitor data:", err);
        setError("Gagal memuat data pengunjung");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-12 bg-muted animate-pulse rounded" />
        </div>

        {/* Loading Chart */}
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Tidak ada data kunjungan.
          </p>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!stats) return <Minus className="h-3 w-3" />;
    switch (stats.trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!stats) return "text-muted-foreground";
    switch (stats.trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            Hari ini: {stats?.totalToday || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {stats?.percentageChange !== undefined
              ? `${stats.percentageChange > 0 ? "+" : ""}${
                  stats.percentageChange
                }%`
              : "0%"}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-32">
        <RechartsWrapper data={data} />
      </div>

      {/* Weekly Summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Total minggu ini</span>
        <Badge variant="secondary" className="text-xs">
          {stats?.totalWeek || 0} kunjungan
        </Badge>
      </div>
    </div>
  );
}

export function VisitorChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            VISITORS
            <Badge variant="outline" className="text-xs ml-auto">
              7 hari
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            {/* Loading skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-32 bg-muted/30 animate-pulse rounded" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          VISITORS
          <Badge variant="outline" className="text-xs ml-auto">
            7 hari
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <VisitorChartContent />
      </CardContent>
    </Card>
  );
}
