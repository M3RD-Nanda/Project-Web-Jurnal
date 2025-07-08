"use client";

import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Data dummy untuk grafik
const articlesPerYearData = [
  { year: 2021, articles: 15 },
  { year: 2022, articles: 22 },
  { year: 2023, articles: 30 },
  { year: 2024, articles: 12 }, // Data hingga pertengahan tahun
];

const acceptanceRateData = [
  { name: "Diterima", value: 60 },
  { name: "Ditolak", value: 40 },
];
const COLORS = ["#0088FE", "#FF8042"]; // Warna untuk Pie Chart

const totalCitationsData = [
  { month: "Jan", citations: 10 },
  { month: "Feb", citations: 15 },
  { month: "Mar", citations: 25 },
  { month: "Apr", citations: 40 },
  { month: "Mei", citations: 60 },
  { month: "Jun", citations: 85 },
];

export default function StatisticsPage() {
  return (
    <StaticContentPage title="STATISTICS">
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
              <BarChart data={articlesPerYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="articles" fill="hsl(var(--primary))" name="Jumlah Artikel" />
              </BarChart>
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
              <PieChart>
                <Pie
                  data={acceptanceRateData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {acceptanceRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
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
              <LineChart data={totalCitationsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="citations" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} name="Jumlah Sitasi" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold mt-8">Statistik Lainnya:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Jumlah Artikel Diterbitkan (Total):** 150+</li>
        <li>**Jumlah Artikel Diterbitkan (Tahun Ini):** 12 (hingga Juni 2024)</li>
        <li>**Waktu Rata-rata dari Pengiriman hingga Publikasi:** 90 hari</li>
        <li>**Total Pengunjung Situs:** 50.000+</li>
        <li>**Total Unduhan Artikel:** 120.000+</li>
        <li>**Negara Pengunjung Teratas:** Indonesia, Malaysia, Singapura, Australia</li>
        <li>**Indeks H-JIMEKA (Google Scholar):** 10</li>
        <li>**Artikel Paling Banyak Disitasi:** "Dampak Kebijakan Fiskal Terhadap Pertumbuhan Ekonomi Regional" oleh Dr. A. Rahman</li>
      </ul>
      <p className="mt-4">
        Data ini diperbarui secara berkala untuk memberikan gambaran yang akurat tentang pertumbuhan dan dampak JIMEKA.
      </p>
    </StaticContentPage>
  );
}