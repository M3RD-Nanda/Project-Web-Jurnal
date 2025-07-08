import { StaticContentPage } from "@/components/StaticContentPage";
import { getAllRatings } from "@/lib/ratings";
import { RatingsClientContent } from "@/components/RatingsClientContent"; // Import the new client component

export default async function RatingsPage() {
  const allRatings = await getAllRatings(); // Mengambil semua rating di sisi server

  return (
    <StaticContentPage title="RATING WEBSITE">
      <RatingsClientContent initialRatings={allRatings} />
    </StaticContentPage>
  );
}