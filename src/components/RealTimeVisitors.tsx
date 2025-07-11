"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentHourVisitors, getVisitorCountByPeriod } from "@/lib/analytics";
import { 
  Users, 
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RealTimeVisitorsProps {
  className?: string;
  refreshInterval?: number; // in milliseconds, default 30 seconds
}

interface VisitorCounts {
  currentHour: number;
  today: number;
  thisWeek: number;
}

export function RealTimeVisitors({ 
  className, 
  refreshInterval = 30000 
}: RealTimeVisitorsProps) {
  const [counts, setCounts] = useState<VisitorCounts>({
    currentHour: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchCounts = async () => {
      try {
        setError(null);
        
        const [currentHour, today, thisWeek] = await Promise.all([
          getCurrentHourVisitors(),
          getVisitorCountByPeriod('day'),
          getVisitorCountByPeriod('week')
        ]);

        setCounts({
          currentHour,
          today,
          thisWeek
        });
        setLastUpdate(new Date());
      } catch (err) {
        console.error("Error fetching real-time visitor counts:", err);
        setError("Gagal memuat data real-time");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCounts();

    // Set up interval for real-time updates
    const interval = setInterval(fetchCounts, refreshInterval);

    return () => clearInterval(interval);
  }, [mounted, refreshInterval]);

  const formatLastUpdate = () => {
    if (!lastUpdate) return "";
    return lastUpdate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!mounted) {
    return (
      <Card className={`bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            REAL-TIME VISITORS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            REAL-TIME VISITORS
            <div className="ml-auto">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary animate-pulse">
              ---
            </div>
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gradient-to-br from-red/5 to-red/10 border-red/20 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-red-500" />
            REAL-TIME VISITORS
            <div className="ml-auto">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          REAL-TIME VISITORS
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <Badge variant="outline" className="text-xs">
              LIVE
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Hour Highlight */}
        <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Jam ini</span>
          </div>
          <div className="text-3xl font-bold text-primary">
            {counts.currentHour}
          </div>
          <p className="text-xs text-muted-foreground">pengunjung aktif</p>
        </div>

        {/* Today and Week Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Hari ini</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {counts.today}
            </div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Minggu ini</span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {counts.thisWeek}
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Update terakhir: {formatLastUpdate()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
