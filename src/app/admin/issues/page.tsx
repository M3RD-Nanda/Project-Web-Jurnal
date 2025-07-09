"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Issue } from "@/lib/issues";
import { IssueTable } from "@/components/admin/IssueTable"; // Akan dibuat selanjutnya
import { IssueForm } from "@/components/admin/IssueForm"; // Akan dibuat selanjutnya
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminIssuesPage() {
  const { session, profile } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/issues');
    const result = await res.json();

    if (res.ok) {
      setIssues(result.data);
    } else {
      toast.error(`Gagal memuat edisi: ${result.error?.message || 'Terjadi kesalahan.'}`);
      setIssues([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!session) {
      toast.error("Anda harus login untuk mengakses halaman ini.");
      router.push("/login");
      return;
    }
    if (profile && profile.role !== 'admin') {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
      router.push("/");
      return;
    }
    fetchIssues();
  }, [session, profile, router]);

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus edisi ini?")) return;

    const res = await fetch(`/api/admin/issues/${id}`, {
      method: 'DELETE',
    });
    const { success, error } = await res.json();

    if (error) {
      toast.error(`Gagal menghapus edisi: ${error.message}`);
    } else if (success) {
      toast.success("Edisi berhasil dihapus!");
      fetchIssues(); // Refresh list
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingIssue(null);
    fetchIssues(); // Refresh list
  };

  if (!session || !profile || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return null; // Redirect handled by useEffect
  }

  return (
    <StaticContentPage title="Kelola Edisi">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Daftar Edisi</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingIssue(null); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Edisi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingIssue ? "Edit Edisi" : "Tambah Edisi Baru"}</DialogTitle>
                <CardDescription>
                  {editingIssue ? "Perbarui detail edisi." : "Isi detail untuk edisi baru."}
                </CardDescription>
              </DialogHeader>
              <IssueForm
                initialData={editingIssue}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <IssueTable
            issues={issues}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}