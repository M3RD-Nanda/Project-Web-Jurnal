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
import { Announcement } from "@/lib/announcements";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AnnouncementTableProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementTable({ announcements, onEdit, onDelete }: AnnouncementTableProps) {
  if (announcements.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">Belum ada pengumuman yang tersedia.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tanggal Publikasi</TableHead>
            <TableHead>Link</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id}>
              <TableCell className="font-medium">{announcement.title}</TableCell>
              <TableCell className="line-clamp-2 max-w-[200px]">{announcement.description || "-"}</TableCell>
              <TableCell>{format(new Date(announcement.publicationDate), "dd MMMM yyyy", { locale: id })}</TableCell>
              <TableCell>
                {announcement.link ? (
                  <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Lihat
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(announcement)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(announcement.id)}>
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