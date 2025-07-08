"use client";

import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllRatings, Rating } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      setLoading(true);
      const fetchedRatings = await getAllRatings();
      setRatings(fetchedRatings);
      setLoading(false);
    };
    fetchRatings();
  }, []);

  return (
    <StaticContentPage title="RATING WEBSITE">
      <p>
        Lihat apa kata pengunjung lain tentang Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
      </p>

      {loading ? (
        <div className="text-center text-muted-foreground p-8">Memuat rating...</div>
      ) : ratings.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border rounded-md bg-muted/20">
          Belum ada rating yang tersedia saat ini. Jadilah yang pertama memberikan rating!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {ratings.map((rating) => (
            <Card key={rating.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((starCount) => (
                    <Star
                      key={starCount}
                      className={cn(
                        "h-5 w-5",
                        rating.stars >= starCount ? "fill-yellow-400 text-yellow-400" : "fill-muted stroke-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <CardTitle className="text-lg font-semibold">{rating.name || "Anonim"}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {format(new Date(rating.created_at), "dd MMMM yyyy, HH:mm", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">"{rating.comment || "Tidak ada komentar."}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StaticContentPage>
  );
}