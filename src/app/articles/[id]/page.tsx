import { StaticContentPage } from "@/components/StaticContentPage";
import { getArticleById, Article } from "@/lib/articles"; // Mengimpor tipe Article
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ArticlePageProps = {
  params: any; // Tetap 'any' untuk params sebagai upaya terakhir untuk kompilasi
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleById(params.id);

  if (!article) {
    notFound();
  }

  return (
    <StaticContentPage title={article.title}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">{article.title}</CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Oleh: {article.authors} | Tanggal Publikasi: {article.publicationDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <h3 className="text-2xl font-semibold mt-8">Abstrak</h3>
          <p>{article.abstract}</p>
          <h3 className="text-2xl font-semibold mt-8">Konten Lengkap</h3>
          <div dangerouslySetInnerHTML={{ __html: article.fullContent }} className="prose dark:prose-invert max-w-none" />
          <h3 className="text-2xl font-semibold mt-8">Kata Kunci</h3>
          <p className="text-base">
            {article.keywords.map((keyword, index) => (
              <span key={keyword} className="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm mr-2 mb-2">
                {keyword}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}