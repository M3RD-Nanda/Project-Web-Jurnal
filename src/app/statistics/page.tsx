"use client";

import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic"; // Import dynamic

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

// Dynamically import Recharts components and wrap them to resolve type issues
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => { const Comp = mod.Bar; return (props: any) => <Comp {...props} />; }), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => { const Comp = mod.XAxis; return (props: any) => <Comp {...props} />; }), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => { const Comp = mod.YAxis; return (props: any) => <Comp {...props} />; }), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => { const Comp = mod.Tooltip; return (props: any) => <Comp {...props} />; }), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((mod) => { const Comp = mod.Pie; return (props: any) => <Comp {...props} />; }), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Legend = dynamic(() => import("recharts").then((mod) => { const Comp = mod.Legend; return (props: any) => <Comp {...props} />; }), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => { const Comp = mod.Line; return (props: any) => <Comp {...props} />; }), { ssr: false });


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
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
    </StaticContentPage>
  );
}