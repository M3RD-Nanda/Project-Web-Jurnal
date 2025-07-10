"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import interfaces for data
import { ArticlesPerYearData, AcceptanceRateData, CitationData } from "@/lib/statistics";

// Dynamically import individual Recharts components with ssr: false
// Explicitly cast the imported module to 'any' to resolve TypeScript compile errors
const ResponsiveContainer: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.ResponsiveContainer), { ssr: false });
const BarChart: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.BarChart), { ssr: false });
const Bar: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Bar), { ssr: false });
const XAxis: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.XAxis), { ssr: false });
const YAxis: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.YAxis), { ssr: false });
const CartesianGrid: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.CartesianGrid), { ssr: false });
const Tooltip: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Tooltip), { ssr: false });
const Legend: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Legend), { ssr: false });
const PieChart: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.PieChart), { ssr: false });
const Pie: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Pie), { ssr: false });
const Cell: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Cell), { ssr: false });
const LineChart: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.LineChart), { ssr: false });
const Line: React.ComponentType<any> = dynamic(() => import("recharts").then((mod: any) => mod.Line), { ssr: false });


interface StatisticsClientContentProps {
  articlesPerYearData: ArticlesPerYearData[];
  acceptanceRateData: AcceptanceRateData[];
  totalCitationsData: CitationData[];
}

export function StatisticsClientContent({ articlesPerYearData, acceptanceRateData, totalCitationsData }: StatisticsClientContentProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Set hasMounted to true only after the component has mounted on the client side.
    // This ensures that Recharts components, which rely on browser APIs (like window.innerWidth),
    // are only rendered when those APIs are available.
    setHasMounted(true);
  }, []);

  // Use theme-aware colors for consistency
  const BAR_FILL_COLOR = "hsl(var(--primary))";
  const LINE_STROKE_COLOR = "hsl(var(--chart-1))";
  const PIE_COLOR_1 = "hsl(var(--chart-2))";
  const PIE_COLOR_2 = "hsl(var(--chart-3))";
  const GRID_STROKE_COLOR = "hsl(var(--border))";
  const AXIS_STROKE_COLOR = "hsl(var(--foreground))";

  const PIE_COLORS = [PIE_COLOR_1, PIE_COLOR_2];

  const totalAcceptedRejected = acceptanceRateData.reduce((sum, item) => sum + item.count, 0);
  const pieChartData = acceptanceRateData.map(item => ({
    name: item.status,
    value: item.count,
    percent: totalAcceptedRejected > 0 ? item.count / totalAcceptedRejected : 0,
  }));

  // Placeholder for charts during SSR or before mounting
  const ChartPlaceholder = () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
    </div>
  );

  return (
    <>
      <p>
        Halaman ini menyajikan statistik penting mengenai Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA). Data ini mencerminkan kinerja jurnal dan dampaknya dalam komunitas ilmiah.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Statistik Publikasi per Tahun */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Artikel Diterbitkan per Tahun</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hasMounted ? (
              articlesPerYearData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={articlesPerYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE_COLOR} />
                    <XAxis dataKey="year" stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
                    <YAxis stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="articles" fill={BAR_FILL_COLOR} name="Jumlah Artikel" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">Data artikel per tahun tidak tersedia.</p>
              )
            ) : (
              <ChartPlaceholder />
            )}
          </CardContent>
        </Card>

        {/* Tingkat Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tingkat Penerimaan Artikel</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {hasMounted ? (
              (pieChartData.length > 0 && totalAcceptedRejected > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">Data tingkat penerimaan tidak tersedia.</p>
              )
            ) : (
              <ChartPlaceholder />
            )}
          </CardContent>
        </Card>

        {/* Statistik Sitasi (Contoh: Total Sitasi per Bulan) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Total Sitasi (Google Scholar)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hasMounted ? (
              totalCitationsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalCitationsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE_COLOR} />
                    <XAxis dataKey="month" stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
                    <YAxis stroke={AXIS_STROKE_COLOR} tick={{ fill: AXIS_STROKE_COLOR }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="citations" stroke={LINE_STROKE_COLOR} activeDot={{ r: 8 }} name="Jumlah Sitasi" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">Data sitasi tidak tersedia.</p>
              )
            ) : (
              <ChartPlaceholder />
            )}
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold mt-8">Statistik Lainnya:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Jumlah Artikel Diterbitkan (Total):</strong> 150+</li>
        <li><strong>Jumlah Artikel Diterbitkan (Tahun Ini):</strong> 12 (hingga Juni 2024)</li>
        <li><strong>Waktu Rata-rata dari Pengiriman hingga Publikasi:</strong> 90 hari</li>
        <li><strong>Total Pengunjung Situs:</strong> 50.000+</li>
        <li><strong>Total Unduhan Artikel:</strong> 120.000+</li>
        <li><strong>Negara Pengunjung Teratas:</strong> Indonesia, Malaysia, Singapura, Australia</li>
        <li><strong>Indeks H-JIMEKA (Google Scholar):</strong> 10</li>
        <li><strong>Artikel Paling Banyak Disitasi:</strong> "Dampak Kebijakan Fiskal Terhadap Pertumbuhan Ekonomi Regional" oleh Dr. A. Rahman</li>
      </ul>
      <p className="mt-4">
        Data ini diperbarui secara berkala untuk memberikan gambaran yang akurat tentang pertumbuhan dan dampak JIMEKA.
      </p>
    </>
  );
}