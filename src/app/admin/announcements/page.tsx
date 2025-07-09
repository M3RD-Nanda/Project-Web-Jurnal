"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Announcement } from "@/lib/announcements";
import { AnnouncementTable } from "@/components/admin/AnnouncementTable";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminAnnouncementsPage() {
  const { session, profile } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false); // Perbaikan di sini
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/announcements');
    const result = await res.json(); // result will be { data: [...] } or { error: { message: '...' } }

    if (res.ok) { // Check if the HTTP status is 2xx
      setAnnouncements(result.data);
    } else {
      toast.error(`Gagal memuat pengumuman: ${result.error?.message || 'Terjadi kesalahan.'}`);
      setAnnouncements([]);
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
    fetchAnnouncements();
  }, [session, profile, router]);

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;

    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
    const { success, error } = await res.json();

    if (error) {
      toast.error(`Gagal menghapus pengumuman: ${error.message}`);
    } else if (success) {
      toast.success("Pengumuman berhasil dihapus!");
      fetchAnnouncements(); // Refresh list
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
    fetchAnnouncements(); // Refresh list
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
    <StaticContentPage title="Kelola Pengumuman">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Daftar Pengumuman</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingAnnouncement(null); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengumuman
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingAnnouncement ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}</DialogTitle>
                <CardDescription>
                  {editingAnnouncement ? "Perbarui detail pengumuman." : "Isi detail untuk pengumuman baru."}
                </CardDescription>
              </DialogHeader>
              <AnnouncementForm
                initialData={editingAnnouncement}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <AnnouncementTable
            announcements={announcements}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}