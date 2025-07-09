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
import Link from "next/link";

interface ArticleTableProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
}

export function ArticleTable({ articles, onEdit, onDelete }: ArticleTableProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">Belum ada artikel yang tersedia.</p>
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
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell className="line-clamp-2 max-w-[150px]">{article.authors}</TableCell>
              <TableCell className="line-clamp-2 max-w-[200px]">{article.abstract}</TableCell>
              <TableCell>{format(new Date(article.publicationDate), "dd MMMM yyyy", { locale: id })}</TableCell>
              <TableCell>{article.issueId || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(article)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(article.id)}>
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