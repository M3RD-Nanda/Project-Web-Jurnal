"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import interfaces for data
import { ArticlesPerYearData, AcceptanceRateData, CitationData } from "@/lib/statistics";

// Dynamically import individual Recharts components with 'as any' to resolve type conflicts
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart as any), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar as any), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend as any), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart as any), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie as any), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell as any), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart as any), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line as any), { ssr: false });


interface StatisticsClientContentProps {
  articlesPerYearData: ArticlesPerYearData[];
  acceptanceRateData: AcceptanceRateData[];
  totalCitationsData: CitationData[];
}

export function StatisticsClientContent({ articlesPerYearData, acceptanceRateData, totalCitationsData }: StatisticsClientContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const COLORS = ["#0088FE", "#FF8042"]; // Warna untuk Pie Chart

  // Calculate percentage for Pie Chart
  const totalAcceptedRejected = acceptanceRateData.reduce((sum, item) => sum + item.count, 0);
  const pieChartData = acceptanceRateData.map(item => ({
    name: item.status,
    value: item.count,
    percent: totalAcceptedRejected > 0 ? item.count / totalAcceptedRejected : 0,
  }));

  // Helper function to render chart content
  const renderChart = (data: any[], ChartComponent: React.ComponentType<any>, chartProps: any, children: React.ReactNode, noDataMessage: string) => {
    if (!mounted) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
        </div>
      );
    }
    if (data.length === 0) {
      return <p className="text-center text-muted-foreground p-4">{noDataMessage}</p>;
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} {...chartProps}>
          <CartesianGrid strokeDasharray="3 3" />
          {children}
        </ChartComponent>
      </ResponsiveContainer>
    );
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
            {renderChart(
              articlesPerYearData,
              BarChart,
              { margin: { top: 20, right: 30, left: 20, bottom: 5 } },
              <>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="articles" fill="hsl(var(--primary))" name="Jumlah Artikel" />
              </>,
              "Data artikel per tahun tidak tersedia."
            )}
          </CardContent>
        </Card>

        {/* Tingkat Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tingkat Penerimaan Artikel</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {renderChart(
              pieChartData,
              PieChart,
              {},
              <>
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
              </>,
              "Data tingkat penerimaan tidak tersedia."
            )}
          </CardContent>
        </Card>

        {/* Statistik Sitasi (Contoh: Total Sitasi per Bulan) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Total Sitasi (Google Scholar)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {renderChart(
              totalCitationsData,
              LineChart,
              { margin: { top: 5, right: 30, left: 20, bottom: 5 } },
              <>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="citations" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} name="Jumlah Sitasi" />
              </>,
              "Data sitasi tidak tersedia."
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