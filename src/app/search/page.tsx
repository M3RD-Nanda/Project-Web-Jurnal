"use client";

import { StaticContentPage } from "@/components/StaticContentPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Data dummy untuk artikel yang bisa dicari
const allArticles = [
  {
    id: 1,
    title: "Analisis Dampak Kebijakan Moneter Terhadap Inflasi di Indonesia",
    authors: "Dr. Budi Santoso, M.E.",
    abstract: "Penelitian ini mengkaji pengaruh kebijakan moneter Bank Indonesia terhadap tingkat inflasi di Indonesia...",
    link: "/articles/1",
  },
  {
    id: 2,
    title: "Peran UMKM dalam Perekonomian Digital: Studi Kasus di Aceh",
    authors: "Prof. Siti Aminah, Ph.D.",
    abstract: "Studi ini menganalisis kontribusi Usaha Mikro, Kecil, dan Menengah (UMKM) dalam ekosistem ekonomi digital di Provinsi Aceh...",
    link: "/articles/2",
  },
  {
    id: 3,
    title: "Efektivitas Program CSR Perusahaan Terhadap Kesejahteraan Masyarakat Lokal",
    authors: "Dra. Fitriani, Ak., M.Si.",
    abstract: "Penelitian ini mengevaluasi efektivitas program Corporate Social Responsibility (CSR) beberapa perusahaan di wilayah tertentu...",
    link: "/articles/3",
  },
  {
    id: 4,
    title: "Dampak Transformasi Digital pada Sektor UMKM",
    authors: "A. Rahman, B. Lestari",
    abstract: "Artikel ini membahas bagaimana transformasi digital mempengaruhi sektor UMKM di Indonesia, dengan fokus pada adopsi teknologi dan dampaknya terhadap pertumbuhan bisnis.",
    link: "/articles/current/1",
  },
  {
    id: 5,
    title: "Analisis Efektivitas Kebijakan Subsidi Energi",
    authors: "C. Wijaya, D. Putri",
    abstract: "Studi ini menganalisis efektivitas kebijakan subsidi energi pemerintah dan dampaknya terhadap perekonomian nasional serta kesejahteraan masyarakat.",
    link: "/articles/current/2",
  },
  {
    id: 6,
    title: "Peran Akuntansi Forensik dalam Pencegahan Fraud",
    authors: "E. Susanto, F. Handayani",
    abstract: "Penelitian ini mengeksplorasi peran akuntansi forensik sebagai alat penting dalam mendeteksi dan mencegah praktik fraud di berbagai organisasi.",
    link: "/articles/current/3",
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof allArticles>([]);
  const [hasSearched, setHasSearched] = useState(false);

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
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" /> Cari
        </Button>
      </form>

      <div className="mt-8">
        {hasSearched && searchResults.length === 0 && (
          <div className="text-center text-muted-foreground p-4 border rounded-md bg-muted/20">
            <p>Tidak ada hasil ditemukan untuk "{searchQuery}". Coba kata kunci lain.</p>
          </div>
        )}

        {searchResults.length > 0 && (
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
                    <Link href={article.link}>Baca Selengkapnya &rarr;</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}