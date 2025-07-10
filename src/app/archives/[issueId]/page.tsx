import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getIssueById } from "@/lib/issues";
import { getArticlesByIssueId, Article } from "@/lib/articles"; // Memperbaiki '=>' menjadi 'from' dan mengimpor tipe Article
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type IssuePageProps = {
  params: any; // Tetap 'any' untuk params sebagai upaya terakhir untuk kompilasi
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function IssueDetailPage({ params }: IssuePageProps) {
  const issue = await getIssueById(params.issueId);

  if (!issue) {
    notFound();
  }

  const articlesInIssue = await getArticlesByIssueId(issue.id);

  return (
    <StaticContentPage title={`Edisi: Vol. ${issue.volume}, No. ${issue.number} (${issue.year})`}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Volume {issue.volume}, Nomor {issue.number} ({issue.year})
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Tanggal Publikasi: {format(new Date(issue.publicationDate), "dd MMMM yyyy", { locale: id })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          {issue.description && (
            <>
              <h3 className="text-xl font-semibold">Deskripsi Edisi</h3>
              <p>{issue.description}</p>
            </>
          )}
          <h3 className="text-xl font-semibold">Daftar Artikel</h3>
          {articlesInIssue.length > 0 ? (
            <ul className="space-y-3">
              {articlesInIssue.map((article: Article) => ( // Menambahkan tipe eksplisit untuk 'article'
                <li key={article.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <Link href={`/articles/${article.id}`} className="text-primary hover:underline text-lg font-medium">
                    {article.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">Oleh: {article.authors}</p>
                  <p className="text-sm line-clamp-2">{article.abstract}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Belum ada artikel yang diterbitkan untuk edisi ini.</p>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild variant="outline">
            <Link href="/archives">Kembali ke Arsip Edisi</Link>
          </Button>
        </CardFooter>
      </Card>
    </StaticContentPage>
  );
}