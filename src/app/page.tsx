import { JournalContent } from "@/components/JournalContent";
import { getAllArticles, Article } from "@/lib/articles"; // Import Article interface
import { getAllAnnouncements, Announcement } from "@/lib/announcements"; // Import Announcement

export default async function Home() {
  const latestArticles: Article[] = await getAllArticles();
  const announcements: Announcement[] = await getAllAnnouncements();

  return (
    <JournalContent initialArticles={latestArticles.slice(0, 3)} initialAnnouncements={announcements.slice(0, 2)} />
  );
}