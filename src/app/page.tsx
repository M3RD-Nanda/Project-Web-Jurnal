import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { JournalContent } from "@/components/JournalContent";
import { Footer } from "@/components/layout/Footer"; // Import the new Footer component

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1">
          <JournalContent />
        </main>
      </div>
      <Footer /> {/* Add the Footer component here */}
      <MadeWithDyad />
    </div>
  );
}