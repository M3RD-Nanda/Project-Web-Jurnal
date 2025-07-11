"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RechartsTest() {
  const [RechartsComponents, setRechartsComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecharts = async () => {
      try {
        console.log("Loading Recharts...");
        const recharts = await import("recharts");
        console.log("Recharts loaded:", recharts);
        setRechartsComponents(recharts);
      } catch (err) {
        console.error("Failed to load Recharts:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadRecharts();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recharts Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading Recharts...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recharts Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!RechartsComponents) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recharts Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">Recharts not loaded</p>
        </CardContent>
      </Card>
    );
  }

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } = RechartsComponents;

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
    <Card>
      <CardHeader>
        <CardTitle>Recharts Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={testData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-green-600">✅ Recharts loaded successfully!</p>
      </CardContent>
    </Card>
  );
}
