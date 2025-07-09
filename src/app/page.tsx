import { JournalContent } from "@/components/JournalContent";
import { getAllArticles, Article } from "@/lib/articles"; // Import Article interface

export default async function Home() {
  const latestArticles: Article[] = await getAllArticles(); // Mengambil artikel dari Supabase

  return (
    <JournalContent initialArticles={latestArticles.slice(0, 3)} /> {/* Meneruskan artikel ke JournalContent */}
  );
}