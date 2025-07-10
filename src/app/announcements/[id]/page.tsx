import { StaticContentPage } from "@/components/StaticContentPage";
import { getAnnouncementById, getAllAnnouncements } from "@/lib/announcements";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

type AnnouncementPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const announcements = await getAllAnnouncements();
  return announcements.map((announcement) => ({
    id: announcement.id,
  }));
}

export default async function AnnouncementDetailPage({ params }: AnnouncementPageProps) {
  const { id } = params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <StaticContentPage title={announcement.title}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {announcement.title}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Tanggal Publikasi:{" "}
            {format(new Date(announcement.publicationDate), "dd MMMM yyyy", {
              locale: dateFnsIdLocale,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <p>{announcement.description}</p>
          {announcement.link && (
            <p>
              <a
                href={announcement.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Lihat Detail Lebih Lanjut &rarr;
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}