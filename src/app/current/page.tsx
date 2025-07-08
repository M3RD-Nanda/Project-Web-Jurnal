import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export default function CurrentPage() {
  // Mengambil artikel yang relevan untuk edisi saat ini dari data dummy
  // Untuk simulasi, kita ambil 3 artikel terbaru yang ada di dummy data
  const currentIssueArticles = getAllArticles().slice(0, 3);

  const currentIssue = {
    volume: 10,
    number: 1,
    year: 2024,
    publicationDate: "30 Juni 2024",
    description: "Edisi terbaru JIMEKA menampilkan penelitian inovatif tentang dampak ekonomi digital, analisis kebijakan fiskal, dan studi kasus akuntansi forensik.",
    articles: currentIssueArticles.map(article => ({
      id: article.id,
      title: article.title,
      authors: article.authors,
      link: `/articles/${article.id}`, // Link ke halaman detail artikel
    })),
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