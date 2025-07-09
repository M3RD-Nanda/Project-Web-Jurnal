import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getLatestIssue } from "@/lib/issues"; // Import getLatestIssue
import { getArticlesByIssueId } from "@/lib/articles"; // Import getArticlesByIssueId
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function CurrentPage() {
  const currentIssue = await getLatestIssue();

  if (!currentIssue) {
    // Handle case where no issues are found
    return (
      <StaticContentPage title="EDISI SAAT INI">
        <p className="text-center text-muted-foreground">Belum ada edisi jurnal yang diterbitkan saat ini.</p>
      </StaticContentPage>
    );
  }

  const articlesInCurrentIssue = await getArticlesByIssueId(currentIssue.id);

  return (
    <StaticContentPage title="EDISI SAAT INI">
      <p>
        Jelajahi artikel-artikel terbaru dari Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Volume {currentIssue.volume}, Nomor {currentIssue.number} ({currentIssue.year})</CardTitle>
          <CardDescription>Tanggal Publikasi: {format(new Date(currentIssue.publicationDate), "dd MMMM yyyy", { locale: id })}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentIssue.description && <p className="text-base mb-4">{currentIssue.description}</p>}
          <h3 className="text-xl font-semibold mb-3">Daftar Artikel:</h3>
          {articlesInCurrentIssue.length > 0 ? (
            <ul className="space-y-2">
              {articlesInCurrentIssue.map((article) => (
                <li key={article.id}>
                  <Link href={`/articles/${article.id}`} className="text-primary hover:underline">
                    {article.title} <span className="text-muted-foreground text-sm">({article.authors})</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Belum ada artikel yang diterbitkan untuk edisi ini.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href={`/archives/${currentIssue.id}`}>Lihat Semua Edisi &rarr;</Link>
          </Button>
        </CardFooter>
      </Card>
    </StaticContentPage>
  );
}