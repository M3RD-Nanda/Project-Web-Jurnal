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
import { Article } from "@/lib/articles"; // Import Article interface
import React, { useState, memo } from "react";
import { Announcement } from "@/lib/announcements"; // Import Announcement
import dynamic from "next/dynamic";

// Lazy load heavy components
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), {
  loading: () => (
    <div className="h-64 bg-gradient-to-r from-primary to-jimeka-blue rounded-lg animate-pulse" />
  ),
});

const CallForPapersSection = dynamic(
  () => import("@/components/sections/CallForPapersSection"),
  {
    loading: () => <div className="h-32 bg-accent rounded-lg animate-pulse" />,
  }
);

interface JournalContentProps {
  initialArticles: Article[];
  initialAnnouncements: Announcement[];
}

// Memoized Article Card Component for better performance
const ArticleCard = memo(({ article }: { article: Article }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        Oleh: {article.authors}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm line-clamp-3">{article.abstract}</p>
    </CardContent>
    <CardFooter>
      <Button variant="link" asChild className="p-0 h-auto">
        <Link href={`/articles/${article.id}`}>Baca Selengkapnya →</Link>
      </Button>
    </CardFooter>
  </Card>
));

ArticleCard.displayName = "ArticleCard";

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

export const JournalContent = memo(function JournalContent({
  initialArticles,
  initialAnnouncements,
}: JournalContentProps) {
  // Remove unnecessary state setters since we don't need to update these
  const latestArticles = initialArticles;
  const announcements = initialAnnouncements;

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      {/* Hero Section - Now lazy loaded */}
      <HeroSection />

      {/* Latest Articles Section */}
      <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-3xl font-bold text-center">Artikel Terbaru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-900">
        <h2 className="text-3xl font-bold text-center">Pengumuman</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Belum ada pengumuman saat ini.
            </p>
          )}
        </div>
      </section>

      {/* Call for Papers Section - Now lazy loaded */}
      <CallForPapersSection />
    </div>
  );
});
