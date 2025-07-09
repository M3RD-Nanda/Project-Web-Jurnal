import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AnnouncementsPage() {
  const announcements = [
    {
      id: 1,
      title: "Panggilan untuk Artikel Volume 10, Nomor 2, Tahun 2024",
      date: "15 Juli 2024",
      description: "JIMEKA membuka kesempatan bagi para peneliti dan akademisi untuk mengirimkan artikel terbaiknya untuk publikasi di Volume 10, Nomor 2. Batas waktu pengiriman adalah 30 September 2024.",
      link: "/announcements/call-for-papers-vol10-no2",
    },
    {
      id: 2,
      title: "Workshop Penulisan Artikel Ilmiah",
      date: "20 Agustus 2024",
      description: "Ikuti workshop kami untuk meningkatkan kualitas penulisan artikel ilmiah Anda. Workshop ini akan membahas tips dan trik penulisan, struktur artikel, dan proses peer-review. Pendaftaran dibuka hingga 10 Agustus 2024.",
      link: "/announcements/workshop-writing",
    },
    {
      id: 3,
      title: "Perubahan Kebijakan Etika Publikasi",
      date: "1 Juli 2024",
      description: "Kami telah memperbarui kebijakan etika publikasi kami untuk memastikan standar integritas akademik yang lebih tinggi. Mohon tinjau kebijakan terbaru di halaman Etika Publikasi.",
      link: "/publication-ethics",
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 container mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Pengumuman Terbaru</CardTitle>
          <CardDescription>Informasi penting dan berita terkini dari JIMEKA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{announcement.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{announcement.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base">{announcement.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={announcement.link}>Lihat Detail &rarr;</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Belum ada pengumuman saat ini.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}