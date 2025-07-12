"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  TrendingUp
} from "lucide-react";
import { runSimpleAnalyticsFix } from "@/scripts/simple-analytics-fix";

interface FixResult {
  success: boolean;
  message: string;
  totalRecords?: number;
  dailyCounts?: { [key: string]: number };
  error?: any;
}

export function SimpleAnalyticsFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  const handleFixData = async () => {
    setIsFixing(true);
    setFixResult(null);

    try {
      const result = await runSimpleAnalyticsFix();
      setFixResult(result);
    } catch (error) {
      setFixResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      });
    } finally {
      setIsFixing(false);
    }
  };

  const getStatusIcon = () => {
    if (isFixing) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (fixResult?.success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (fixResult && !fixResult.success) return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isFixing) return "Mereset data...";
    if (fixResult?.success) return "Data berhasil direset";
    if (fixResult && !fixResult.success) return "Gagal mereset data";
    return "Siap untuk mereset data";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          Simple Analytics Reset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {/* Problem Description */}
        <Alert className="border-orange-200 bg-orange-50">
          <Database className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Solusi Sederhana:</strong> Script ini akan menghapus SEMUA data analytics dan menggantinya dengan data realistis (3-8 visits per hari untuk 6 hari terakhir).
          </AlertDescription>
        </Alert>

        {/* Fix Button */}
        <Button 
          onClick={handleFixData} 
          disabled={isFixing}
          className="w-full bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          {isFixing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mereset Data...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Reset Data Analytics
            </>
          )}
        </Button>

        {/* Results */}
        {fixResult && (
          <div className="space-y-3">
            <Alert className={fixResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {fixResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={fixResult.success ? "text-green-800" : "text-red-800"}>
                {fixResult.message}
              </AlertDescription>
            </Alert>

            {fixResult.success && fixResult.dailyCounts && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Data Baru (Per Hari)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Object.entries(fixResult.dailyCounts)
                      .map(([date, count]) => (
                        <div key={date} className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <span className="font-medium">{date}</span>
                          <Badge variant="secondary">{count} visits</Badge>
                        </div>
                      ))}
                  </div>
                  
                  {fixResult.totalRecords !== undefined && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total records baru:</span>
                        <span>{fixResult.totalRecords}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!fixResult.success && fixResult.error && (
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600">Error Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-red-50 p-2 rounded overflow-auto">
                    {JSON.stringify(fixResult.error, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Catatan:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Script ini akan menghapus SEMUA data analytics yang ada</li>
            <li>Data baru akan dibuat dengan pola realistis (3-8 visits per hari)</li>
            <li>Hanya data untuk 6 hari terakhir (tidak termasuk hari ini)</li>
            <li>Setelah reset, refresh halaman analytics untuk melihat perubahan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
