"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/articles";
import { ArticleTable } from "@/components/admin/ArticleTable";
import { ArticleForm } from "@/components/admin/ArticleForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteArticleAction } from "@/actions/articles"; // Import Server Action for delete

export default function AdminArticlesPage() {
  const { session, profile } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    if (!session) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/articles", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const result = await res.json();

    if (res.ok) {
      console.log("Raw API response:", result.data);
      console.log("First article sample:", result.data[0]);
      setArticles(result.data);
    } else {
      toast.error(
        `Gagal memuat artikel: ${result.error?.message || "Terjadi kesalahan."}`
      );
      setArticles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!session) {
      toast.error("Anda harus login untuk mengakses halaman ini.");
      router.push("/login");
      return;
    }
    if (profile && profile.role !== "admin") {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
      router.push("/");
      return;
    }
    fetchArticles();
  }, [session, profile, router]);

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
    if (!session) {
      toast.error("Anda tidak terautentikasi.");
      return;
    }

    const { success, error } = await deleteArticleAction(id); // Call Server Action

    if (error) {
      toast.error(`Gagal menghapus artikel: ${error}`);
    } else if (success) {
      toast.success("Artikel berhasil dihapus!");
      fetchArticles(); // Refresh list
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingArticle(null);
    fetchArticles(); // Refresh list
  };

  if (!session || !profile || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  if (profile.role !== "admin") {
    return null; // Redirect handled by useEffect
  }

  return (
    <StaticContentPage title="Kelola Artikel">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Daftar Artikel</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingArticle(null);
                  setIsFormOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Artikel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}
                </DialogTitle>
                <CardDescription>
                  {editingArticle
                    ? "Perbarui detail artikel."
                    : "Isi detail untuk artikel baru."}
                </CardDescription>
              </DialogHeader>
              <ArticleForm
                initialData={editingArticle}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <ArticleTable
            articles={articles}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}
