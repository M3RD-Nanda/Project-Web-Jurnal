import { StaticContentPage } from "@/components/StaticContentPage";
import { StatisticsClientContent } from "@/components/StatisticsClientContent";
import { getArticlesPerYear, getAcceptanceRates, getCitations } from "@/lib/statistics"; // Import fungsi pengambilan data

export default async function StatisticsPage() {
  // Mengambil data dari Supabase
  const articlesPerYearData = await getArticlesPerYear();
  const acceptanceRateData = await getAcceptanceRates();
  const totalCitationsData = await getCitations();

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