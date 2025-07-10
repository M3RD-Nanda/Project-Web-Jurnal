"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Article } from "@/lib/articles";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArticleForm } from "./article-form";
import { useState } from "react";
import { toast } from "sonner";
import { deleteArticle } from "@/lib/articles";

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: "Judul",
  },
  {
    accessorKey: "authors",
    header: "Penulis",
  },
  {
    accessorKey: "publicationDate",
    header: "Tanggal Publikasi",
    cell: ({ row }) => { // row sudah diinfer dari ColumnDef<Article>
      const date = new Date(row.getValue("publicationDate"));
      return date.toLocaleDateString("id-ID");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => { // row sudah diinfer dari ColumnDef<Article>
      const article = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

      const handleDelete = async () => {
        if (confirm(`Apakah Anda yakin ingin menghapus artikel "${article.title}"?`)) {
          const { success, error } = await deleteArticle(article.id);
          if (success) {
            toast.success("Artikel berhasil dihapus.");
            window.location.reload(); // Simple reload for now
          } else {
            toast.error(`Gagal menghapus artikel: ${error?.message || "Terjadi kesalahan."}`);
          }
        }
      };

      return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(article.id)}
              >
                Salin ID Artikel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuItem onClick={handleDelete}>Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownContent>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Artikel</DialogTitle>
              <DialogDescription>
                Edit detail artikel di sini. Klik simpan saat selesai.
              </DialogDescription>
            </DialogHeader>
            <ArticleForm initialData={article} onSave={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      );
    },
  },
];