"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { session, profile } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      toast.error("Anda harus login untuk mengakses halaman ini.");
      router.push("/login");
      return;
    }
    if (profile && profile.role !== 'admin') {
      toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
      router.push("/"); // Redirect non-admins
    }
  }, [session, profile, router]);

  if (!session || !profile) {
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
    <StaticContentPage title="Admin Dashboard">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Selamat Datang, Admin!</CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Ini adalah halaman dashboard admin. Anda dapat mengelola konten di sini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <p>Sebagai admin, Anda memiliki akses untuk:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Mengelola Artikel (tambah, edit, hapus)</li>
            <li>Mengelola Edisi Jurnal (tambah, edit, hapus)</li>
            <li>Mengelola Pengumuman (tambah, edit, hapus)</li>
            <li>Melihat dan mengelola Rating</li>
            <li>Mengelola Pengguna (opsional, jika diperlukan)</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Untuk saat ini, pengelolaan data secara visual dapat dilakukan melalui <a href="https://supabase.com/dashboard/project/xlvnaempudqlrdonfzun/editor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Studio</a>.
            Di masa mendatang, fitur pengelolaan langsung di website ini dapat dikembangkan.
          </p>
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}