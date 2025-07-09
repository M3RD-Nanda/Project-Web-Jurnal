"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
            Pilih bagian yang ingin Anda kelola.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button asChild className="h-24 text-xl">
              <Link href="/admin/announcements">Kelola Pengumuman</Link>
            </Button>
            <Button asChild className="h-24 text-xl" variant="outline" disabled>
              <Link href="#">Kelola Artikel (Segera Hadir)</Link>
            </Button>
            <Button asChild className="h-24 text-xl" variant="outline" disabled>
              <Link href="#">Kelola Edisi (Segera Hadir)</Link>
            </Button>
            <Button asChild className="h-24 text-xl" variant="outline" disabled>
              <Link href="#">Kelola Pengguna (Segera Hadir)</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            Untuk saat ini, pengelolaan data secara visual dapat dilakukan melalui <a href="https://supabase.com/dashboard/project/xlvnaempudqlrdonfzun/editor" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Studio</a>.
            Fitur pengelolaan langsung di website ini akan dikembangkan secara bertahap.
          </p>
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}