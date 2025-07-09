import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllIssues } from "@/lib/issues"; // Import getAllIssues
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function ArchivesPage() {
  const archivedIssues = await getAllIssues();

  return (
    <StaticContentPage title="ARSIP JURNAL">
      <p>
        Telusuri edisi-edisi sebelumnya dari Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {archivedIssues.length > 0 ? (
          archivedIssues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Volume {issue.volume}, Nomor {issue.number}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Tahun {issue.year} | {format(new Date(issue.publicationDate), "dd MMMM yyyy", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issue.description && <p className="text-sm line-clamp-3 mb-2">{issue.description}</p>}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href={`/archives/${issue.id}`}>Lihat Edisi &rarr;</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground p-4 border rounded-md bg-muted/20">
            Belum ada edisi arsip yang tersedia.
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}