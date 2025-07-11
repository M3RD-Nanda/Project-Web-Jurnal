"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Article } from "@/lib/articles";

interface SearchClientContentProps {
  initialArticles: Article[];
}

export function SearchClientContent({ initialArticles }: SearchClientContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // Tidak lagi memuat data awal di sini

  // Inisialisasi searchResults dengan semua artikel jika belum ada pencarian yang dilakukan
  useEffect(() => {
    if (!hasSearched && searchQuery.trim() === "") {
      setSearchResults(initialArticles);
    }
  }, [initialArticles, hasSearched, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true); // Menunjukkan pencarian sedang berlangsung

    // Simulasikan penundaan kecil untuk pemrosesan pencarian jika diperlukan, atau hapus untuk hasil instan
    setTimeout(() => {
      if (searchQuery.trim() === "") {
        setSearchResults(initialArticles); // Tampilkan semua artikel jika query pencarian kosong
      } else {
        const filtered = initialArticles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (article.keywords && article.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase())))
        );
        setSearchResults(filtered);
      }
      setLoading(false);
    }, 200); // Penundaan kecil untuk UX
  };

  return (
    <>
      <p>
        Gunakan bilah pencarian di bawah ini untuk menemukan artikel, penulis, atau topik tertentu di JIMEKA.
      </p>
      <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2 mx-auto mt-6">
        <Input
          type="text"
          placeholder="Cari artikel..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <Search className="h-4 w-4 mr-2" /> {loading ? "Mencari..." : "Cari"}
        </Button>
      </form>

      <div className="mt-8">
        {loading && hasSearched ? ( // Hanya tampilkan loading jika pencarian sedang aktif
          <p className="text-center text-muted-foreground">Mencari artikel...</p>
        ) : hasSearched && searchResults.length === 0 && searchQuery.trim() !== "" ? (
          <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted/20">
            <p>Tidak ada hasil ditemukan untuk "{searchQuery}". Coba kata kunci lain.</p>
          </div>
        ) : (
          searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Hasil Pencarian ({searchResults.length})</h3>
              {searchResults.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{article.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">Oleh: {article.authors}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{article.abstract}</p>
                    <Button variant="link" asChild className="p-0 h-auto mt-2">
                      <Link href={`/articles/${article.id}`}>Baca Selengkapnya &rarr;</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}