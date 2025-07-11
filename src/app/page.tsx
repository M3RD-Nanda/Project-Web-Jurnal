import { JournalContent } from "@/components/JournalContent";
import { getAllArticles, Article } from "@/lib/articles"; // Import Article interface
import { getAllAnnouncements, Announcement } from "@/lib/announcements"; // Import Announcement
import {
  generateMetadata as generateSEOMetadata,
  SITE_CONFIG,
} from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: SITE_CONFIG.shortName,
  description: SITE_CONFIG.description,
  canonical: SITE_CONFIG.url,
  keywords: ["jurnal terbaru", "artikel terbaru", "pengumuman"],
  openGraph: {
    type: "website",
    image: `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(
      SITE_CONFIG.name
    )}&subtitle=${encodeURIComponent(
      "Halaman Utama - Artikel dan Pengumuman Terbaru"
    )}&type=website`,
  },
});

export default async function Home() {
  const latestArticles: Article[] = await getAllArticles();
  const announcements: Announcement[] = await getAllAnnouncements();

  return (
    <JournalContent
      initialArticles={latestArticles.slice(0, 3)}
      initialAnnouncements={announcements.slice(0, 2)}
    />
  );
}