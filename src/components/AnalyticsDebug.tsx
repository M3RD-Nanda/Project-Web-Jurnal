"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  getDailyVisits, 
  getVisitorStats, 
  getTopPages,
  DailyVisitData,
  VisitorStats,
  TopPage
} from "@/lib/analytics";
import { Users, Activity, TrendingUp } from "lucide-react";

export function AnalyticsDebug() {
  const [dailyData, setDailyData] = useState<DailyVisitData[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      
      // Fetch data sequentially for better debugging
      const daily = await getDailyVisits(7);
      setDailyData(daily);
      
      const stats = await getVisitorStats();
      setVisitorStats(stats);
      
      const pages = await getTopPages(7);
      setTopPages(pages);
      
      
    } catch (err) {
      console.error("[AnalyticsDebug] Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalVisitors = dailyData.reduce((sum, day) => sum + day.visitors, 0);
  const maxVisitors = Math.max(...dailyData.map(day => day.visitors));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Analytics Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchData} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Refresh Data"}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {visitorStats?.totalToday || 0}
            </div>
            <div className="text-xs text-blue-500">Hari Ini</div>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {totalVisitors}
            </div>
            <div className="text-xs text-green-500">7 Hari</div>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {topPages.length}
            </div>
            <div className="text-xs text-purple-500">Halaman</div>
          </div>
        </div>
        
        {/* Mini Chart */}
        {dailyData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">7 Hari Terakhir</h4>
            <div className="space-y-1">
              {dailyData.map((day, index) => {
                const percentage = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0;
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-8 text-right">{day.date}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-right">{day.visitors}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Top Pages */}
        {topPages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Halaman Populer</h4>
            <div className="space-y-1">
              {topPages.slice(0, 3).map((page, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="truncate">{page.path}</span>
                  <span className="font-semibold">{page.visits}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
