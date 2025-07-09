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
import { Issue } from "@/lib/issues";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface IssueTableProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (id: string) => void;
}

export function IssueTable({ issues, onEdit, onDelete }: IssueTableProps) {
  if (issues.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">Belum ada edisi yang tersedia.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Volume</TableHead>
            <TableHead>Nomor</TableHead>
            <TableHead>Tahun</TableHead>
            <TableHead>Tanggal Publikasi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">{issue.volume}</TableCell>
              <TableCell>{issue.number}</TableCell>
              <TableCell>{issue.year}</TableCell>
              <TableCell>{format(new Date(issue.publicationDate), "dd MMMM yyyy", { locale: id })}</TableCell>
              <TableCell className="line-clamp-2 max-w-[200px]">{issue.description || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(issue)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(issue.id)}>
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