"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AnalyticsTest() {
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testRPC = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Testing RPC call...");
      
      const result = await supabase.rpc("get_daily_visit_counts", {
        start_date: "2025-07-03T00:00:00.000Z",
        end_date: "2025-07-10T23:59:59.999Z"
      });
      
      console.log("RPC Result:", result);
      setRpcResult(result);
      
    } catch (err) {
      console.error("RPC Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRPC();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Analytics RPC Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testRPC} disabled={loading}>
          {loading ? "Testing..." : "Test RPC"}
        </Button>
        
        {error && (
          <div className="p-2 bg-red-100 text-red-800 rounded">
            Error: {error}
          </div>
        )}
        
        {rpcResult && (
          <div className="space-y-2">
            <h4 className="font-semibold">RPC Result:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(rpcResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
