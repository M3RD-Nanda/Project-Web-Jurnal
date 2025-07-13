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
  TopPage,
} from "@/lib/analytics";
import { AnalyticsTest } from "@/components/AnalyticsTest";
import { AnalyticsDebug } from "@/components/AnalyticsDebug";
import { RechartsTest } from "@/components/RechartsTest";
import { AnalyticsComprehensiveTest } from "@/components/AnalyticsComprehensiveTest";
import { AnalyticsDataFixer } from "@/components/AnalyticsDataFixer";
import { SimpleAnalyticsFixer } from "@/components/SimpleAnalyticsFixer";
import { FinalAnalyticsFixer } from "@/components/FinalAnalyticsFixer";

export default function TestAnalyticsPage() {
  const [dailyData, setDailyData] = useState<DailyVisitData[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {

      // Test direct RPC call first
      const { supabase } = await import("@/integrations/supabase/client");

      const rpcResult = await supabase.rpc("get_daily_visit_counts", {
        start_date: "2025-07-03T00:00:00.000Z",
        end_date: "2025-07-10T23:59:59.999Z",
      });

      // Test getDailyVisits
      const daily = await getDailyVisits(7);
      setDailyData(daily);

      // Test getVisitorStats
      const stats = await getVisitorStats();
      setVisitorStats(stats);

      // Test getTopPages
      const pages = await getTopPages(7);
      setTopPages(pages);
    } catch (err) {
      console.error("Analytics test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAnalytics();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Analytics Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Testing analytics functions and data display
        </p>
        <Button onClick={testAnalytics} disabled={loading} className="mt-4">
          {loading ? "Testing..." : "Test Analytics"}
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Fixer */}
      <AnalyticsDataFixer />

      {/* Simple Data Fixer */}
      <SimpleAnalyticsFixer />

      {/* Final Data Fixer */}
      <FinalAnalyticsFixer />

      {/* Comprehensive Test */}
      <AnalyticsComprehensiveTest />

      {/* Debug Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsTest />
        <AnalyticsDebug />
        <RechartsTest />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Visits */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Visits (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyData.length > 0 ? (
                dailyData.map((day, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{day.date}</span>
                    <span className="font-semibold">{day.visitors}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visitor Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {visitorStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Today:</span>
                  <span className="font-semibold">
                    {visitorStats.totalToday}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Week:</span>
                  <span className="font-semibold">
                    {visitorStats.totalWeek}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-semibold">
                    {visitorStats.percentageChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Trend:</span>
                  <span className="font-semibold">{visitorStats.trend}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.length > 0 ? (
                topPages.map((page, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm truncate">{page.path}</span>
                      <span className="font-semibold">{page.visits}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {page.percentage}%
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (for debugging)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Daily Data:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(dailyData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">Visitor Stats:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(visitorStats, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">Top Pages:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(topPages, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
