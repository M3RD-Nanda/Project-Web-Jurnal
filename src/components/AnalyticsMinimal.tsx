"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  getDailyVisits,
  getVisitorStats,
  getTopPages,
  DailyVisitData,
  VisitorStats,
  TopPage,
} from "@/lib/analytics";

export function AnalyticsMinimal() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visitorData, setVisitorData] = useState<DailyVisitData[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Trigger data fetch on component mount
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch visitor data with detailed logging
      const dailyData = await getDailyVisits(7);

      const stats = await getVisitorStats();

      const pagesData = await getTopPages(7);

      // Ensure we have data, even if empty
      setVisitorData(dailyData || []);
      setVisitorStats(
        stats || {
          totalToday: 0,
          totalWeek: 0,
          percentageChange: 0,
          trend: "stable",
        }
      );
      setTopPages((pagesData || []).slice(0, 5));
      setLastUpdated(new Date());
    } catch (error) {
      console.error("[AnalyticsMinimal] Error fetching analytics data:", error);
      // Set fallback data on error
      setVisitorData([]);
      setVisitorStats({
        totalToday: 0,
        totalWeek: 0,
        percentageChange: 0,
        trend: "stable",
      });
      setTopPages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // This useEffect was already defined above, removing duplicate

  const handleRefresh = () => {
    fetchData(true);
  };

  const getTrendIcon = () => {
    if (!visitorStats) return <Minus className="h-3 w-3" />;
    switch (visitorStats.trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getPageIcon = (path: string) => {
    if (path === "/" || path === "/home") return "🏠";
    if (path.includes("/articles") || path.includes("/article")) return "📄";
    if (path.includes("/about")) return "ℹ️";
    if (path.includes("/contact")) return "📧";
    if (path.includes("/statistics")) return "📊";
    return "📄";
  };

  const getPageName = (path: string) => {
    if (path === "/" || path === "/home") return "Beranda";
    if (path.includes("/articles") || path.includes("/article"))
      return "Artikel";
    if (path.includes("/about")) return "Tentang";
    if (path.includes("/contact")) return "Kontak";
    if (path.includes("/statistics")) return "Statistik";
    return path
      .replace(/^\//, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const maxVisitors = Math.max(...visitorData.map((d) => d.visitors), 1);
  const totalVisitors = visitorData.reduce((sum, d) => sum + d.visitors, 0);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none cursor-pointer hover:bg-sidebar-accent/80 transition-all duration-200 hover:shadow-sm">
          <CardContent className="p-3">
            {loading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-sidebar-primary animate-pulse" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-sidebar-primary" />
                    <span className="text-xs font-medium text-sidebar-primary">
                      ANALYTICS
                    </span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>

                {/* Mini Chart */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Visitors</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon()}
                      <span className="font-medium">
                        {visitorStats?.totalToday || 0}
                      </span>
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="flex items-end gap-0.5 h-8 bg-gray-100 dark:bg-gray-800 rounded p-1 border">
                    {visitorData.length > 0
                      ? visitorData.slice(-7).map((day, index) => {
                          const height =
                            maxVisitors > 0
                              ? (day.visitors / maxVisitors) * 100
                              : 0;

                          return (
                            <div
                              key={index}
                              className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-sm min-h-[3px] transition-all duration-300 opacity-80 hover:opacity-100"
                              style={{ height: `${Math.max(height, 15)}%` }}
                              title={`${day.date}: ${day.visitors} visitors`}
                            />
                          );
                        })
                      : // Show placeholder bars when no data
                        Array.from({ length: 7 }, (_, index) => (
                          <div
                            key={index}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-sm min-h-[3px] opacity-50"
                            style={{ height: "15%" }}
                            title="No data"
                          />
                        ))}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 hari: {totalVisitors || 0}</span>
                  <span>Top: {topPages[0]?.visits || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6 text-primary" />
              Analytics Dashboard
            </DialogTitle>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
          <DialogDescription>
            Lihat statistik pengunjung website JEBAKA secara detail dengan data
            real-time dan analisis halaman populer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Visitor Statistics */}
          <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Statistik Pengunjung
                  </h3>
                </div>

                {/* Today and Weekly Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Hari ini</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {visitorStats?.totalToday || 0}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Minggu ini</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {visitorStats?.totalWeek || 0}
                    </div>
                  </div>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {visitorStats?.trend === "up"
                      ? "Meningkat"
                      : visitorStats?.trend === "down"
                      ? "Menurun"
                      : "Stabil"}
                  </span>
                  {visitorStats?.percentageChange !== 0 && (
                    <Badge
                      variant={
                        visitorStats?.trend === "up" ? "default" : "secondary"
                      }
                    >
                      {visitorStats?.percentageChange !== undefined
                        ? `${visitorStats.percentageChange > 0 ? "+" : ""}${
                            visitorStats.percentageChange
                          }%`
                        : "0%"}
                    </Badge>
                  )}
                </div>

                {/* Weekly Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    7 Hari Terakhir
                  </h4>
                  <div className="space-y-2">
                    {visitorData.map((day, index) => {
                      const percentage =
                        maxVisitors > 0
                          ? (day.visitors / maxVisitors) * 100
                          : 0;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-12 text-right font-medium">
                            {day.date}
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-12 text-right font-medium">
                            {day.visitors}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Halaman Populer</h3>
                  <Badge variant="outline" className="text-xs ml-auto">
                    7 hari
                  </Badge>
                </div>

                <div className="space-y-3">
                  {topPages.map((page) => (
                    <div
                      key={page.path}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-lg">
                        {getPageIcon(page.path)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {getPageName(page.path)}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.path}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${page.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {page.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{page.visits}</div>
                        <div className="text-xs text-muted-foreground">
                          kunjungan
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {topPages.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada data halaman populer</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
