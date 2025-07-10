import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArticleForm } from "./_components/article-form";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";
import { getAllArticles } from "@/lib/articles"; // Mengubah dari getArticles menjadi getAllArticles
import { useState } from "react";

export default async function AdminArticlesPage() {
  const articles = await getAllArticles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelola Artikel</CardTitle>
        <CardDescription>
          Tambahkan, edit, atau hapus artikel jurnal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Tambah Artikel</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Artikel</DialogTitle>
                <DialogDescription>
                  Isi detail artikel baru di sini. Klik simpan saat selesai.
                </DialogDescription>
              </DialogHeader>
              <ArticleForm onSave={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <DataTable columns={columns} data={articles} filterColumnId="title" />
      </CardContent>
    </Card>
  );
}