"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitorStats, VisitorStats } from "@/lib/analytics";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Eye,
  Calendar,
  Clock,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitorStatsCardProps {
  className?: string;
}

export function VisitorStatsCard({ className }: VisitorStatsCardProps) {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const visitorStats = await getVisitorStats();
        setStats(visitorStats);
      } catch (err) {
        console.error("Error fetching visitor stats:", err);
        setError("Gagal memuat statistik pengunjung");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const getTrendIcon = () => {
    if (!stats) return <Minus className="h-4 w-4 text-muted-foreground" />;
    switch (stats.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!stats) return "text-muted-foreground";
    switch (stats.trend) {
      case 'up':
        return "text-green-600 bg-green-50 border-green-200";
      case 'down':
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  const getTrendText = () => {
    if (!stats) return "Stabil";
    switch (stats.trend) {
      case 'up':
        return "Meningkat";
      case 'down':
        return "Menurun";
      default:
        return "Stabil";
    }
  };

  if (!mounted) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            STATISTIK PENGUNJUNG
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            STATISTIK PENGUNJUNG
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            STATISTIK PENGUNJUNG
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          STATISTIK PENGUNJUNG
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today and Weekly Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Hari ini</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalToday || 0}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">Minggu ini</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {stats?.totalWeek || 0}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getTrendColor()}`}>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-sm font-medium">{getTrendText()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {stats?.percentageChange !== undefined 
              ? `${stats.percentageChange > 0 ? '+' : ''}${stats.percentageChange}%`
              : '0%'
            }
          </Badge>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground text-center">
          Dibandingkan dengan kemarin
        </div>
      </CardContent>
    </Card>
  );
}
