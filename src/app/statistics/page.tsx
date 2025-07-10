import { StaticContentPage } from "@/components/StaticContentPage";
import { StatisticsClientContent } from "@/components/StatisticsClientContent";
// No longer importing getArticlesPerYear, getAcceptanceRates, getCitations from "@/lib/statistics"

export default async function StatisticsPage() {
  // Data dummy lokal untuk grafik
  const articlesPerYearData = [
    { year: 2021, articles: 15 },
    { year: 2022, articles: 22 },
    { year: 2023, articles: 30 },
    { year: 2024, articles: 12 }, // Data hingga pertengahan tahun
  ];

  const acceptanceRateData = [
    { status: "Diterima", value: 60, count: 60 }, // Changed 'name' to 'status'
    { status: "Ditolak", value: 40, count: 40 }, // Changed 'name' to 'status'
  ];

  const totalCitationsData = [
    { id: "1", month: "Jan", citations: 10 }, // Added 'id' to match CitationData interface
    { id: "2", month: "Feb", citations: 15 },
    { id: "3", month: "Mar", citations: 25 },
    { id: "4", month: "Apr", citations: 40 },
    { id: "5", month: "Mei", citations: 60 },
    { id: "6", month: "Jun", citations: 85 },
  ];

  return (
    <StaticContentPage title="STATISTICS">
      <StatisticsClientContent
        articlesPerYearData={articlesPerYearData}
        acceptanceRateData={acceptanceRateData}
        totalCitationsData={totalCitationsData}
      />
    </StaticContentPage>
  );
}