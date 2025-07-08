import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ArchivesPage() {
  const archivedIssues = [
    { volume: 9, number: 2, year: 2023, link: "/archives/volume-9-number-2" },
    { volume: 9, number: 1, year: 2023, link: "/archives/volume-9-number-1" },
    { volume: 8, number: 2, year: 2022, link: "/archives/volume-8-number-2" },
    { volume: 8, number: 1, year: 2022, link: "/archives/volume-8-number-1" },
    { volume: 7, number: 2, year: 2021, link: "/archives/volume-7-number-2" },
    { volume: 7, number: 1, year: 2021, link: "/archives/volume-7-number-1" },
  ];

  return (
    <StaticContentPage title="ARSIP JURNAL">
      <p>
        Telusuri edisi-edisi sebelumnya dari Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {archivedIssues.map((issue) => (
          <Card key={`${issue.volume}-${issue.number}`} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-xl">Volume {issue.volume}, Nomor {issue.number}</CardTitle>
              <p className="text-sm text-muted-foreground">Tahun {issue.year}</p>
            </CardHeader>
            <CardContent>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href={issue.link}>Lihat Edisi &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </StaticContentPage>
  );
}