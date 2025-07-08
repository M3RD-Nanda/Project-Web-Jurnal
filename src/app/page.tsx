import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { JournalContent } from "@/components/JournalContent";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar /> {/* Sidebar hanya akan muncul di desktop */}
        <main className="flex-1">
          <JournalContent />
        </main>
      </div>
      <Footer />
    </div>
  );
}