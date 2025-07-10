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
import { Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/users";
import { UserTable } from "@/components/admin/UserTable";
import { UserForm } from "@/components/admin/UserForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminUsersPage() {
  const { session, profile } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    if (!session) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/admin/users", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const result = await res.json();

    if (res.ok) {
      setUsers(result.data);
    } else {
      toast.error(
        `Gagal memuat pengguna: ${
          result.error?.message || "Terjadi kesalahan."
        }`
      );
      setUsers([]);
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
    fetchUsers();
  }, [session, profile, router]);

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;
    if (!session) {
      toast.error("Anda tidak terautentikasi.");
      return;
    }

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const { success, error } = await res.json();

    if (error) {
      toast.error(`Gagal menghapus pengguna: ${error.message}`);
    } else if (success) {
      toast.success("Pengguna berhasil dihapus!");
      fetchUsers(); // Refresh list
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    fetchUsers(); // Refresh list
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
    <StaticContentPage title="Kelola Pengguna">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Daftar Pengguna</CardTitle>
          {/* Add User button is not typically needed for Auth users, as they register themselves.
              If admin-created users are needed, this button can be enabled. */}
          {/* <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
                <CardDescription>
                  {editingUser ? "Perbarui detail pengguna." : "Isi detail untuk pengguna baru."}
                </CardDescription>
              </DialogHeader>
              <UserForm
                initialData={editingUser} // Pass initialData for editing
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog> */}
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Dialog for editing user */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <CardDescription>
              Perbarui detail profil dan peran pengguna.
            </CardDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              initialData={editingUser}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </StaticContentPage>
  );
}
