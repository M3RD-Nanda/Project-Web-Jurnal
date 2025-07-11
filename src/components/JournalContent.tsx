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
import { Article, getAllArticles } from "@/lib/articles"; // Import Article interface
import React, { useEffect, useState } from "react";
import { Announcement, getAllAnnouncements } from "@/lib/announcements"; // Import Announcement and getAllAnnouncements

interface JournalContentProps {
  initialArticles: Article[];
  initialAnnouncements: Announcement[];
}

export function JournalContent({
  initialArticles,
  initialAnnouncements,
}: JournalContentProps) {
  const [latestArticles, setLatestArticles] =
    useState<Article[]>(initialArticles);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);

  // Jika Anda ingin memuat ulang artikel di sisi klien (misalnya setelah aksi tertentu),
  // Anda bisa menggunakan useEffect di sini. Namun, untuk SSR, initialArticles sudah cukup.
  // useEffect(() => {
  //   const fetchArticles = async () => {
  //     const articles = await getAllArticles();
  //     setLatestArticles(articles.slice(0, 3));
  //   };
  //   fetchArticles();
  // }, []);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-jimeka-blue text-primary-foreground p-8 rounded-lg shadow-lg animate-in fade-in zoom-in duration-500">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa
          </h1>
          <p className="text-lg md:text-xl mb-6 opacity-90">
            Platform terkemuka untuk publikasi penelitian inovatif di bidang
            Ekonomi dan Akuntansi dari Universitas Percobaan Nanda.
          </p>
          <Button
            asChild
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors duration-300"
          >
            <Link href="/submission-guidelines">
              Kirim Artikel Anda Sekarang
            </Link>
          </Button>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
        <h2 className="text-3xl font-bold text-center">Artikel Terbaru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => (
            <Card
              key={article.id}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Oleh: {article.authors}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{article.abstract}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href={`/articles/${article.id}`}>
                    Baca Selengkapnya &rarr;
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-900">
        <h2 className="text-3xl font-bold text-center">Pengumuman</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {announcement.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {announcement.publicationDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-2">
                    {announcement.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href={announcement.link || "#"}>
                      Lihat Detail &rarr;
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Belum ada pengumuman saat ini.
            </p>
          )}
        </div>
      </section>

      {/* Call for Papers Section */}
      <section className="bg-accent text-accent-foreground p-8 rounded-lg shadow-md text-center animate-in fade-in duration-1000">
        <h2 className="text-3xl font-bold mb-4">Panggilan untuk Artikel</h2>
        <p className="text-lg mb-6">
          Kami mengundang para akademisi, peneliti, dan praktisi untuk
          mengirimkan naskah asli mereka. Jadilah bagian dari kontribusi ilmiah
          di bidang Ekonomi dan Akuntansi.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
        >
          <Link href="/submission-guidelines">Informasi Pengiriman</Link>
        </Button>
      </section>
    </div>
  );
}
