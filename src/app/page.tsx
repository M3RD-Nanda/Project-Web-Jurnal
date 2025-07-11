import { JournalContent } from "@/components/JournalContent";
import { Article } from "@/lib/articles"; // Import Article interface
import { Announcement } from "@/lib/announcements"; // Import Announcement
import { getCachedArticles, getCachedAnnouncements } from "@/lib/cache";
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

// Enable static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  // Use cached functions for better performance
  const latestArticles: Article[] = await getCachedArticles();
  const announcements: Announcement[] = await getCachedAnnouncements();

  return (
    <JournalContent
      initialArticles={latestArticles.slice(0, 3)}
      initialAnnouncements={announcements.slice(0, 2)}
    />
  );
}
