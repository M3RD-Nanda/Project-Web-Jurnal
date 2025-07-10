import { StaticContentPage } from "@/components/StaticContentPage";
import { getArticleById } from "@/lib/articles";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type ArticlePageProps = {
  params: Promise<{ id: string }>; // Next.js 15 requires params to be a Promise
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params; // Await the params Promise
  const article = await getArticleById(id); // Menggunakan await untuk mengambil data

  if (!article) {
    notFound();
  }

  return (
    <StaticContentPage title={article.title}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {article.title}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Oleh: {article.authors} | Tanggal Publikasi:{" "}
            {article.publicationDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <h3 className="text-2xl font-semibold mt-8">Abstrak</h3>
          <p>{article.abstract}</p>
          <h3 className="text-2xl font-semibold mt-8">Konten Lengkap</h3>
          <div
            dangerouslySetInnerHTML={{ __html: article.fullContent }}
            className="prose dark:prose-invert max-w-none"
          />
          <h3 className="text-2xl font-semibold mt-8">Kata Kunci</h3>
          <p className="text-base">
            {article.keywords.map((keyword, index) => (
              <span
                key={keyword}
                className="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm mr-2 mb-2"
              >
                {keyword}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}
