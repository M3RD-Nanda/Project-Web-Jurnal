import { StaticContentPage } from "@/components/StaticContentPage";
import { getAllArticles } from "@/lib/articles";
import { SearchClientContent } from "@/components/SearchClientContent"; // Import the new client component

export default async function SearchPage() {
  const allArticles = await getAllArticles(); // Mengambil semua artikel di sisi server

  return (
    <StaticContentPage title="CARI ARTIKEL">
      <SearchClientContent initialArticles={allArticles} />
    </StaticContentPage>
  );
}