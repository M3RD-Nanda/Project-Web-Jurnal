"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Article } from "@/lib/articles";
import { format } from "date-fns";
import { id } from "date-fns/locale";
// import Link from "next/link"; // Not used currently

interface ArticleTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
}

export function ArticleTable({
  articles,
  onEdit,
  onDelete,
}: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">
        Belum ada artikel yang tersedia.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Penulis</TableHead>
            <TableHead>Abstrak</TableHead>
            <TableHead>Tanggal Publikasi</TableHead>
            <TableHead>Edisi ID</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              {/* Kolom 1: Judul */}
              <TableCell className="font-medium">
                <div className="max-w-[200px] truncate" title={article.title}>
                  {article.title}
                </div>
              </TableCell>

              {/* Kolom 2: Penulis */}
              <TableCell>
                <div className="max-w-[150px] truncate" title={article.authors}>
                  {article.authors}
                </div>
              </TableCell>

              {/* Kolom 3: Abstrak */}
              <TableCell>
                <div
                  className="max-w-[200px] line-clamp-2"
                  title={article.abstract}
                >
                  {article.abstract || "Abstrak tidak tersedia"}
                </div>
              </TableCell>

              {/* Kolom 4: Tanggal Publikasi */}
              <TableCell>
                {(() => {
                  try {
                    if (!article.publicationDate) {
                      return "Tanggal tidak tersedia";
                    }

                    const date = new Date(article.publicationDate);

                    if (isNaN(date.getTime())) {
                      return "Format tanggal tidak valid";
                    }

                    return format(date, "dd MMMM yyyy", { locale: id });
                  } catch (error) {
                    console.error("Error formatting date:", error);
                    return "Error format tanggal";
                  }
                })()}
              </TableCell>

              {/* Kolom 5: Edisi ID */}
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {(() => {
                    // Jika ada data edisi lengkap, tampilkan format user-friendly
                    if (
                      article.issueVolume &&
                      article.issueNumber &&
                      article.issueYear
                    ) {
                      return `Vol. ${article.issueVolume}, No. ${article.issueNumber} (${article.issueYear})`;
                    }
                    // Jika hanya ada issueId, tampilkan ID mentah
                    if (article.issueId) {
                      return `ID: ${article.issueId.substring(0, 8)}...`;
                    }
                    // Jika tidak ada edisi
                    return "-";
                  })()}
                </span>
              </TableCell>

              {/* Kolom 6: Aksi */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(article)}
                    title="Edit artikel"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(article.id)}
                    title="Hapus artikel"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Hapus</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
