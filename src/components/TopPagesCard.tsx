"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  ExternalLink,
  TrendingUp,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface PageVisit {
  path: string;
  visits: number;
  percentage: number;
}

interface TopPagesCardProps {
  className?: string;
  days?: number;
}

export function TopPagesCard({ className, days = 7 }: TopPagesCardProps) {
  const [pages, setPages] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchTopPages = async () => {
      try {
        setLoading(true);
        setError(null);

        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);

        const startDateStr = format(startOfDay(startDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        const endDateStr = format(endOfDay(endDate), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

        const { data, error } = await supabase
          .from("page_visits")
          .select("path")
          .gte("visited_at", startDateStr)
          .lte("visited_at", endDateStr);

        if (error) {
          throw new Error(`Failed to fetch page visits: ${error.message}`);
        }

        // Count visits per path
        const pathCounts: { [key: string]: number } = {};
        let totalVisits = 0;

        (data || []).forEach((visit) => {
          pathCounts[visit.path] = (pathCounts[visit.path] || 0) + 1;
          totalVisits++;
        });

        // Convert to array and sort by visits
        const sortedPages = Object.entries(pathCounts)
          .map(([path, visits]) => ({
            path,
            visits,
            percentage: totalVisits > 0 ? (visits / totalVisits) * 100 : 0
          }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5); // Top 5 pages

        setPages(sortedPages);
      } catch (err) {
        console.error("Error fetching top pages:", err);
        setError("Gagal memuat halaman populer");
      } finally {
        setLoading(false);
      }
    };

    fetchTopPages();
  }, [mounted, days]);

  const getPageName = (path: string) => {
    if (path === "/") return "Beranda";
    if (path === "/articles") return "Artikel";
    if (path === "/issues") return "Edisi";
    if (path === "/announcements") return "Pengumuman";
    if (path === "/statistics") return "Statistik";
    if (path === "/about") return "Tentang";
    if (path.startsWith("/articles/")) return "Detail Artikel";
    if (path.startsWith("/issues/")) return "Detail Edisi";
    if (path.startsWith("/announcements/")) return "Detail Pengumuman";
    return path;
  };

  const getPageIcon = (path: string) => {
    if (path === "/") return "🏠";
    if (path === "/articles" || path.startsWith("/articles/")) return "📄";
    if (path === "/issues" || path.startsWith("/issues/")) return "📚";
    if (path === "/announcements" || path.startsWith("/announcements/")) return "📢";
    if (path === "/statistics") return "📊";
    if (path === "/about") return "ℹ️";
    return "📄";
  };

  if (!mounted) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            HALAMAN POPULER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            HALAMAN POPULER
            <Badge variant="outline" className="text-xs ml-auto">
              {days} hari
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            HALAMAN POPULER
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            HALAMAN POPULER
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Tidak ada data kunjungan halaman.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          HALAMAN POPULER
          <Badge variant="outline" className="text-xs ml-auto">
            {days} hari
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pages.map((page, index) => (
          <div key={page.path} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-sm">
              {getPageIcon(page.path)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {getPageName(page.path)}
              </div>
              <div className="text-xs text-muted-foreground">
                {page.visits} kunjungan • {page.percentage.toFixed(1)}%
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              #{index + 1}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
