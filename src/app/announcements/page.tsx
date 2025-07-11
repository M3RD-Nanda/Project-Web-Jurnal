import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAllAnnouncements } from "@/lib/announcements"; // Import getAllAnnouncements

export default async function AnnouncementsPage() {
  const announcements = await getAllAnnouncements();

  return (
    <div className="flex-1 p-4 md:p-8 container mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Pengumuman Terbaru
          </CardTitle>
          <CardDescription>
            Informasi penting dan berita terkini dari JEBAKA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {announcement.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {announcement.publicationDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{announcement.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={announcement.link || "#"}>
                      Lihat Detail &rarr;
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Belum ada pengumuman saat ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
