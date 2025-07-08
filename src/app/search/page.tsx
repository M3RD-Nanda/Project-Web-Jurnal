"use client";

import { StaticContentPage } from "@/components/StaticContentPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react"; // Import useEffect
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllArticles, Article } from "@/lib/articles"; // Import Article interface

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allArticles, setAllArticles] = useState<Article[]>([]); // State untuk menyimpan semua artikel
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true); // State untuk loading

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const articles = await getAllArticles();
      setAllArticles(articles);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = allArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  };

  return (
    <StaticContentPage title="CARI ARTIKEL">
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
          <Search className="h-4 w-4 mr-2" /> Cari
        </Button>
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="text-center text-muted-foreground">Memuat artikel...</p>
        ) : hasSearched && searchResults.length === 0 ? (
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
    </StaticContentPage>
  );
}