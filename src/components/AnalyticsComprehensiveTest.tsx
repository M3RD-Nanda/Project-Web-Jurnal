"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getDailyVisits, 
  getVisitorStats, 
  getTopPages,
  DailyVisitData,
  VisitorStats,
  TopPage
} from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
  data?: any;
}

export function AnalyticsComprehensiveTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recharts, setRecharts] = useState<any>(null);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Database Connection
      addResult({ name: "Database Connection", status: "success", message: "Testing..." });
      
      const { data: dbTest, error: dbError } = await supabase
        .from("page_visits")
        .select("count", { count: "exact" })
        .limit(1);
      
      if (dbError) {
        addResult({ name: "Database Connection", status: "error", message: dbError.message });
      } else {
        addResult({ name: "Database Connection", status: "success", message: `Connected. Total visits: ${dbTest?.length || 0}` });
      }

      // Test 2: RPC Functions
      addResult({ name: "RPC Functions", status: "success", message: "Testing..." });
      
      try {
        const rpcResult = await supabase.rpc("get_daily_visit_counts", {
          start_date: "2025-07-09T00:00:00.000Z",
          end_date: "2025-07-10T23:59:59.999Z"
        });
        
        if (rpcResult.error) {
          addResult({ name: "RPC Functions", status: "error", message: rpcResult.error.message });
        } else {
          addResult({ name: "RPC Functions", status: "success", message: `RPC working. Found ${rpcResult.data?.length || 0} days` });
        }
      } catch (rpcErr) {
        addResult({ name: "RPC Functions", status: "error", message: `RPC failed: ${rpcErr}` });
      }

      // Test 3: Analytics Functions
      addResult({ name: "getDailyVisits", status: "success", message: "Testing..." });
      
      try {
        const dailyData = await getDailyVisits(7);
        addResult({ 
          name: "getDailyVisits", 
          status: "success", 
          message: `Returned ${dailyData.length} days`, 
          data: dailyData 
        });
      } catch (dailyErr) {
        addResult({ name: "getDailyVisits", status: "error", message: `Failed: ${dailyErr}` });
      }

      addResult({ name: "getVisitorStats", status: "success", message: "Testing..." });
      
      try {
        const statsData = await getVisitorStats();
        addResult({ 
          name: "getVisitorStats", 
          status: "success", 
          message: `Today: ${statsData.totalToday}, Week: ${statsData.totalWeek}`, 
          data: statsData 
        });
      } catch (statsErr) {
        addResult({ name: "getVisitorStats", status: "error", message: `Failed: ${statsErr}` });
      }

      addResult({ name: "getTopPages", status: "success", message: "Testing..." });
      
      try {
        const pagesData = await getTopPages(7);
        addResult({ 
          name: "getTopPages", 
          status: "success", 
          message: `Found ${pagesData.length} pages`, 
          data: pagesData 
        });
      } catch (pagesErr) {
        addResult({ name: "getTopPages", status: "error", message: `Failed: ${pagesErr}` });
      }

      // Test 4: Recharts
      addResult({ name: "Recharts Library", status: "success", message: "Testing..." });
      
      try {
        const rechartsLib = await import("recharts");
        setRecharts(rechartsLib);
        addResult({ name: "Recharts Library", status: "success", message: "Loaded successfully" });
      } catch (rechartsErr) {
        addResult({ name: "Recharts Library", status: "error", message: `Failed to load: ${rechartsErr}` });
      }

    } catch (globalErr) {
      addResult({ name: "Global Error", status: "error", message: `${globalErr}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          Analytics Comprehensive Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading} className="w-full">
          {loading ? "Running Tests..." : "Run All Tests"}
        </Button>
        
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{result.name}</span>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">View Data</summary>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recharts Test Chart */}
        {recharts && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Recharts Test Chart</h4>
            <div className="h-64 border rounded p-4">
              <RechartsTestChart recharts={recharts} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RechartsTestChart({ recharts }: { recharts: any }) {
  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } = recharts;
  
  const testData = [
    { name: "Sen", value: 10 },
    { name: "Sel", value: 20 },
    { name: "Rab", value: 15 },
    { name: "Kam", value: 25 },
    { name: "Jum", value: 18 },
    { name: "Sab", value: 12 },
    { name: "Min", value: 8 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={testData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
