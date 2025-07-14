"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Announcement } from "@/lib/announcements";
import { memo } from "react";

// Memoized Announcement Card Component for better performance
const AnnouncementCard = memo(
  ({ announcement }: { announcement: Announcement }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {announcement.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {announcement.publicationDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{announcement.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild className="p-0 h-auto">
          <Link href={announcement.link || "#"}>Lihat Detail →</Link>
        </Button>
      </CardFooter>
    </Card>
  )
);

AnnouncementCard.displayName = "AnnouncementCard";

interface AnnouncementCardListProps {
  announcements: Announcement[];
}

const AnnouncementCardList = memo(function AnnouncementCardList({ 
  announcements 
}: AnnouncementCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {announcements.length > 0 ? (
        announcements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
          />
        ))
      ) : (
        <p className="text-center text-muted-foreground col-span-2">
          Belum ada pengumuman saat ini.
        </p>
      )}
    </div>
  );
});

export default AnnouncementCardList;
