"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import interfaces for data AND chart props from "@/lib/statistics"
import {
  ArticlesPerYearData,
  AcceptanceRateData,
  CitationData,
  ArticlesBarChartProps, // Imported from src/lib/statistics
  AcceptancePieChartProps, // Imported from src/lib/statistics
  CitationsLineChartProps, // Imported from src/lib/statistics
} from "@/lib/statistics";

// Dynamically import the full chart components with ssr: false
// Explicitly type the dynamically imported components with their respective props interfaces
const ArticlesBarChart: React.ComponentType<ArticlesBarChartProps> = dynamic(
  () =>
    import("@/components/charts/ArticlesBarChart").then(
      (mod) => mod.ArticlesBarChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
      </div>
    ),
  }
);

const AcceptancePieChart: React.ComponentType<AcceptancePieChartProps> =
  dynamic(
    () =>
      import("@/components/charts/AcceptancePieChart").then(
        (mod) => mod.AcceptancePieChart
      ),
    {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
        </div>
      ),
    }
  );

const CitationsLineChart: React.ComponentType<CitationsLineChartProps> =
  dynamic(
    () =>
      import("@/components/charts/CitationsLineChart").then(
        (mod) => mod.CitationsLineChart
      ),
    {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">Memuat grafik...</p>
        </div>
      ),
    }
  );

interface StatisticsClientContentProps {
  articlesPerYearData: ArticlesPerYearData[];
  acceptanceRateData: AcceptanceRateData[];
  totalCitationsData: CitationData[];
}

export function StatisticsClientContent({
  articlesPerYearData,
  acceptanceRateData,
  totalCitationsData,
}: StatisticsClientContentProps) {
  return (
    <>
      <p>
        Halaman ini menyajikan statistik penting mengenai Jurnal Ekonomi Bisnis
        dan Akuntansi Mahasiswa (JEBAKA). Data ini mencerminkan kinerja jurnal
        dan dampaknya dalam komunitas ilmiah.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Statistik Publikasi per Tahun */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Artikel Diterbitkan per Tahun
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ArticlesBarChart data={articlesPerYearData} />
          </CardContent>
        </Card>

        {/* Tingkat Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Tingkat Penerimaan Artikel
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <AcceptancePieChart data={acceptanceRateData} />
          </CardContent>
        </Card>

        {/* Statistik Sitasi (Contoh: Total Sitasi per Bulan) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Total Sitasi (Google Scholar)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <CitationsLineChart data={totalCitationsData} />
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold mt-8">Statistik Lainnya:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Jumlah Artikel Diterbitkan (Total):</strong> 150+
        </li>
        <li>
          <strong>Jumlah Artikel Diterbitkan (Tahun Ini):</strong> 12 (hingga
          Juni 2024)
        </li>
        <li>
          <strong>Waktu Rata-rata dari Pengiriman hingga Publikasi:</strong> 90
          hari
        </li>
        <li>
          <strong>Total Pengunjung Situs:</strong> 50.000+
        </li>
        <li>
          <strong>Total Unduhan Artikel:</strong> 120.000+
        </li>
        <li>
          <strong>Negara Pengunjung Teratas:</strong> Indonesia, Malaysia,
          Singapura, Australia
        </li>
        <li>
          <strong>Indeks H-JEBAKA (Google Scholar):</strong> 10
        </li>
        <li>
          <strong>Artikel Paling Banyak Disitasi:</strong> "Dampak Kebijakan
          Fiskal Terhadap Pertumbuhan Ekonomi Regional" oleh Dr. A. Rahman
        </li>
      </ul>
      <p className="mt-4">
        Data ini diperbarui secara berkala untuk memberikan gambaran yang akurat
        tentang pertumbuhan dan dampak JEBAKA.
      </p>
    </>
  );
}

export default StatisticsClientContent;
