import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CurrentPage() {
  const currentIssue = {
    volume: 10,
    number: 1,
    year: 2024,
    publicationDate: "30 Juni 2024",
    description: "Edisi terbaru JIMEKA menampilkan penelitian inovatif tentang dampak ekonomi digital, analisis kebijakan fiskal, dan studi kasus akuntansi forensik.",
    articles: [
      { id: 1, title: "Dampak Transformasi Digital pada Sektor UMKM", authors: "A. Rahman, B. Lestari", link: "/articles/current/1" },
      { id: 2, title: "Analisis Efektivitas Kebijakan Subsidi Energi", authors: "C. Wijaya, D. Putri", link: "/articles/current/2" },
      { id: 3, title: "Peran Akuntansi Forensik dalam Pencegahan Fraud", authors: "E. Susanto, F. Handayani", link: "/articles/current/3" },
    ],
  };

  return (
    <StaticContentPage title="EDISI SAAT INI">
      <p>
        Jelajahi artikel-artikel terbaru dari Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Volume {currentIssue.volume}, Nomor {currentIssue.number} ({currentIssue.year})</CardTitle>
          <CardDescription>Tanggal Publikasi: {currentIssue.publicationDate}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-base mb-4">{currentIssue.description}</p>
          <h3 className="text-xl font-semibold mb-3">Daftar Artikel:</h3>
          <ul className="space-y-2">
            {currentIssue.articles.map((article) => (
              <li key={article.id}>
                <Link href={article.link} className="text-primary hover:underline">
                  {article.title} <span className="text-muted-foreground text-sm">({article.authors})</span>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href={`/archives/volume-${currentIssue.volume}-number-${currentIssue.number}`}>Lihat Semua Artikel Edisi Ini</Link>
          </Button>
        </CardFooter>
      </Card>
    </StaticContentPage>
  );
}