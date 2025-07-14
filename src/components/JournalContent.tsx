"use client";

// Removed unused imports - components are now lazy loaded
import { Article } from "@/lib/articles"; // Import Article interface
import React, { memo } from "react";
import { Announcement } from "@/lib/announcements"; // Import Announcement
import dynamic from "next/dynamic";
import { LazyComponent } from "@/components/ui/intersection-observer";

// Lazy load heavy components with better optimization
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), {
  loading: () => (
    <div className="h-64 bg-gradient-to-r from-primary to-jimeka-blue rounded-lg animate-pulse" />
  ),
  ssr: false, // Disable SSR for better initial load
});

const CallForPapersSection = dynamic(
  () => import("@/components/sections/CallForPapersSection"),
  {
    loading: () => <div className="h-32 bg-accent rounded-lg animate-pulse" />,
    ssr: false, // Disable SSR for better initial load
  }
);

// Lazy load article and announcement cards for better performance
const ArticleCardList = dynamic(
  () => import("@/components/ui/article-card-list"),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: true, // Keep SSR for SEO
  }
);

const AnnouncementCardList = dynamic(
  () => import("@/components/ui/announcement-card-list"),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    ),
    ssr: true, // Keep SSR for SEO
  }
);

interface JournalContentProps {
  initialArticles: Article[];
  initialAnnouncements: Announcement[];
}

// Components are now lazy loaded from separate files for better bundle splitting

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
      <LazyComponent height={400} className="space-y-6">
        <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-3xl font-bold text-center">Artikel Terbaru</h2>
          <ArticleCardList articles={latestArticles} />
        </section>
      </LazyComponent>

      {/* Announcements Section */}
      <LazyComponent height={300} className="space-y-6">
        <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-900">
          <h2 className="text-3xl font-bold text-center">Pengumuman</h2>
          <AnnouncementCardList announcements={announcements} />
        </section>
      </LazyComponent>

      {/* Call for Papers Section - Now lazy loaded */}
      <CallForPapersSection />
    </div>
  );
});
