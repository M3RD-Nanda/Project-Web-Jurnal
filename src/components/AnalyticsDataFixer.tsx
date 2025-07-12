"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wrench, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  TrendingUp
} from "lucide-react";
import { runAnalyticsDataFix } from "@/scripts/fix-analytics-data";

interface FixResult {
  success: boolean;
  message: string;
  oldRecords?: number;
  newRecords?: number;
  dailyCounts?: { [key: string]: number };
  error?: any;
}

export function AnalyticsDataFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  const handleFixData = async () => {
    setIsFixing(true);
    setFixResult(null);

    try {
      const result = await runAnalyticsDataFix();
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
    if (isFixing) return "Memperbaiki data...";
    if (fixResult?.success) return "Data berhasil diperbaiki";
    if (fixResult && !fixResult.success) return "Gagal memperbaiki data";
    return "Siap untuk memperbaiki data";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Analytics Data Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {/* Problem Description */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Masalah yang terdeteksi:</strong> Analytics dashboard menampilkan nilai yang tidak realistis (1000 visits pada satu hari). 
            Script ini akan membersihkan data yang bermasalah dan menggantinya dengan data yang lebih realistis.
          </AlertDescription>
        </Alert>

        {/* Fix Button */}
        <Button 
          onClick={handleFixData} 
          disabled={isFixing}
          className="w-full"
          size="lg"
        >
          {isFixing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memperbaiki Data...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Perbaiki Data Analytics
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
                    Data Baru (7 Hari Terakhir)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(fixResult.dailyCounts)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([date, count]) => (
                        <div key={date} className="flex justify-between items-center p-2 rounded bg-muted/30">
                          <span className="font-medium">{date}</span>
                          <Badge variant="secondary">{count} visits</Badge>
                        </div>
                      ))}
                  </div>
                  
                  {fixResult.oldRecords !== undefined && fixResult.newRecords !== undefined && (
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Records lama:</span>
                        <span>{fixResult.oldRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Records baru:</span>
                        <span>{fixResult.newRecords}</span>
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
            <li>Script ini akan menghapus data dengan lebih dari 50 visits per hari</li>
            <li>Data baru akan dibuat dengan pola yang realistis (5-25 visits per hari)</li>
            <li>Setelah perbaikan, refresh halaman analytics untuk melihat perubahan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
