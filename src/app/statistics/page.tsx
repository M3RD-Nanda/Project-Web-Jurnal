import { StaticContentPage } from "@/components/StaticContentPage";
import { StatisticsClientContent } from "@/components/StatisticsClientContent";
import { getArticlesPerYear, getAcceptanceRates, getCitations } from "@/lib/statistics";

export default async function StatisticsPage() {
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