import { StaticContentPage } from "@/components/StaticContentPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"; // Import Search icon

export default function SearchPage() {
  return (
    <StaticContentPage title="CARI ARTIKEL">
      <p>
        Gunakan bilah pencarian di bawah ini untuk menemukan artikel, penulis, atau topik tertentu di JIMEKA.
      </p>
      <div className="flex w-full max-w-md items-center space-x-2 mx-auto mt-6">
        <Input type="text" placeholder="Cari artikel..." className="flex-1" />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" /> Cari
        </Button>
      </div>
      <div className="mt-8 text-center text-muted-foreground">
        <p>Hasil pencarian akan ditampilkan di sini.</p>
        {/* Placeholder for search results */}
        <div className="mt-4 p-4 border rounded-md bg-muted/20 min-h-[150px] flex items-center justify-center">
          <p>Tidak ada hasil ditemukan. Coba kata kunci lain.</p>
        </div>
      </div>
    </StaticContentPage>
  );
}