"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyVisits, DailyVisitData } from "@/lib/analytics";
import { Loader2, TrendingUp, Users } from "lucide-react";

export function VisitorChartSimple() {
  const [data, setData] = useState<DailyVisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchVisits = async () => {
      try {
        setLoading(true);
        setError(null);
        const dailyData = await getDailyVisits(7);
        setData(dailyData);
      } catch (err) {
        console.error("Error fetching visitor data:", err);
        setError("Gagal memuat data pengunjung");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [mounted]);

  if (!mounted) {
    return (
      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary flex items-center gap-2">
            <Users className="h-4 w-4" />
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

  if (loading) {
    return (
      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary flex items-center gap-2">
            <Users className="h-4 w-4" />
            VISITORS (Mingguan)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[150px] p-2">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-sidebar-primary" />
            <p className="ml-2 text-sm text-sidebar-foreground">Memuat data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary flex items-center gap-2">
            <Users className="h-4 w-4" />
            VISITORS (Mingguan)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[150px] p-2">
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-sm text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVisitors = data.reduce((sum, day) => sum + day.visitors, 0);
  const maxVisitors = Math.max(...data.map(day => day.visitors));

  return (
    <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-sidebar-primary flex items-center gap-2">
          <Users className="h-4 w-4" />
          VISITORS (Mingguan)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[150px] p-2">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-sm text-muted-foreground">
              Tidak ada data kunjungan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>Total: {totalVisitors}</span>
              </div>
              <div>
                <span>Puncak: {maxVisitors}</span>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="space-y-2">
              {data.map((day, index) => {
                const percentage = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0;
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-8 text-right">{day.date}</div>
                    <div className="flex-1 bg-sidebar-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-sidebar-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-6 text-right">{day.visitors}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
