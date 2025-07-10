"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import interfaces for data
import { ArticlesPerYearData, AcceptanceRateData, CitationData } from "@/lib/statistics";

// Dynamically import individual Recharts components and explicitly type them as React.ComponentType<any>
// This helps bypass strict type checking issues with Recharts' defaultProps when used with next/dynamic.
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true after the component has mounted on the client side.
    // This ensures that Recharts components, which rely on DOM, only render client-side.
    setMounted(true);

    // --- Logging untuk debugging ---
    console.log("StatisticsClientContent: Component mounted.");
    console.log("StatisticsClientContent: articlesPerYearData received:", articlesPerYearData);
    console.log("StatisticsClientContent: acceptanceRateData received:", acceptanceRateData);
    console.log("StatisticsClientContent: totalCitationsData received:", totalCitationsData);
    // --- Akhir logging ---

  }, [articlesPerYearData, acceptanceRateData, totalCitationsData]); // Depend on data to re-log if it changes

  const COLORS = ["#0088FE", "#FF8042"]; // Warna untuk Pie Chart

  // Calculate percentage for Pie Chart
  const totalAcceptedRejected = acceptanceRateData.reduce((sum, item) => sum + item.count, 0);
  const pieChartData = acceptanceRateData.map(item => ({
    name: item.status,
    value: item.count,
    percent: totalAcceptedRejected > 0 ? item.count / totalAcceptedRejected : 0,
  }));
  console.log("StatisticsClientContent: pieChartData calculated:", pieChartData);

  // Helper component to render chart content or fallback
  const ChartContent = ({ mounted, data, message, children }: { mounted: boolean; data: any[]; message: string; children: React.ReactNode }) => {
    if (!mounted) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
        </div>
      );
    }
    if (data.length === 0) {
      return (
        <p className="text-center text-muted-foreground p-4 h-full flex items-center justify-center">{message}</p>
      );
    }
    return children;
  };

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
            <ResponsiveContainer width="100%" height="100%">
              <ChartContent mounted={mounted} data={articlesPerYearData} message="Data artikel per tahun tidak tersedia.">
                <BarChart data={articlesPerYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="articles" fill="hsl(var(--primary))" name="Jumlah Artikel" />
                </BarChart>
              </ChartContent>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tingkat Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tingkat Penerimaan Artikel</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContent mounted={mounted} data={pieChartData} message="Data tingkat penerimaan tidak tersedia.">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ChartContent>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statistik Sitasi (Contoh: Total Sitasi per Bulan) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Total Sitasi (Google Scholar)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContent mounted={mounted} data={totalCitationsData} message="Data sitasi tidak tersedia.">
                <LineChart data={totalCitationsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="citations" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} name="Jumlah Sitasi" />
                </LineChart>
              </ChartContent>
            </ResponsiveContainer>
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