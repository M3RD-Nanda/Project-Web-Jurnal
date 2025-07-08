import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { JournalContent } from "@/components/JournalContent";
import { Footer } from "@/components/layout/Footer";
import { getAllArticles } from "@/lib/articles"; // Import getAllArticles

export default async function Home() { // Menjadikan komponen async
  const latestArticles = await getAllArticles(); // Mengambil artikel dari Supabase

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1">
          <JournalContent initialArticles={latestArticles.slice(0,3)} /> {/* Meneruskan artikel ke JournalContent */}
        </main>
      </div>
      <Footer />
    </div>
  );
}