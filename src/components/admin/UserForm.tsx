"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { UserProfile } from "@/lib/users";

const userFormSchema = z.object({
  email: z.string().email("Email tidak valid.").min(1, "Email wajib diisi."),
  username: z.string().optional(),
  salutation: z.string().optional(),
  first_name: z.string().min(1, "Nama depan wajib diisi."),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Nama belakang wajib diisi."),
  initials: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan", "Lainnya", "Tidak Disebutkan"]).optional(),
  affiliation: z.string().optional(),
  signature: z.string().optional(),
  orcid_id: z.string().optional(),
  url: z.string().url("URL tidak valid.").or(z.literal("")).optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  mailing_address: z.string().optional(),
  bio_statement: z.string().optional(),
  country: z.string().optional(),
  is_reader: z.boolean(),
  is_author: z.boolean(),
  profile_image_url: z.string().url("URL gambar profil tidak valid.").or(z.literal("")).optional(),
  role: z.enum(["user", "admin", "editor", "reviewer"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData: UserProfile;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: initialData.email,
      username: initialData.username ?? undefined,
      salutation: initialData.salutation ?? undefined,
      first_name: initialData.first_name ?? "",
      middle_name: initialData.middle_name ?? undefined,
      last_name: initialData.last_name ?? "",
      initials: initialData.initials ?? undefined,
      gender: (initialData.gender as UserFormValues['gender']) ?? "Tidak Disebutkan",
      affiliation: initialData.affiliation ?? undefined,
      signature: initialData.signature ?? undefined,
      orcid_id: initialData.orcid_id ?? undefined,
      url: initialData.url ?? undefined,
      phone: initialData.phone ?? undefined,
      fax: initialData.fax ?? undefined,
      mailing_address: initialData.mailing_address ?? undefined,
      bio_statement: initialData.bio_statement ?? undefined,
      country: initialData.country ?? undefined,
      is_reader: initialData.is_reader,
      is_author: initialData.is_author,
      profile_image_url: initialData.profile_image_url ?? undefined,
      role: (initialData.role as UserFormValues['role']) || "user",
    },
    mode: "onChange",
  });

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    
    const payload = {
      profileData: {
        username: values.username || null,
        salutation: values.salutation || null,
        first_name: values.first_name,
        middle_name: values.middle_name || null,
        last_name: values.last_name,
        initials: values.initials || null,
        gender: values.gender || null,
        affiliation: values.affiliation || null,
        signature: values.signature || null,
        orcid_id: values.orcid_id || null,
        url: values.url || null,
        phone: values.phone || null,
        fax: values.fax || null,
        mailing_address: values.mailing_address || null,
        bio_statement: values.bio_statement || null,
        country: values.country || null,
        is_reader: values.is_reader,
        is_author: values.is_author,
        profile_image_url: values.profile_image_url || null,
        role: values.role,
      },
      authMetadata: {
        first_name: values.first_name,
        last_name: values.last_name,
      }
    };

    const res = await fetch(`/api/admin/users/${initialData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Tambahkan ini
    });
    const result = await res.json();

    if (!res.ok) {
      toast.error(`Gagal memperbarui pengguna: ${result.error?.message || 'Terjadi kesalahan.'}`);
    } else {
      toast.success("Profil pengguna berhasil diperbarui!");
      onSuccess();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" disabled {...field} />
              </FormControl>
              <FormDescription>Email tidak dapat diubah dari sini.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Depan *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Belakang *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran Pengguna</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salutation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salutation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Salutation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Prof.">Prof.</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                    <SelectItem value="Tidak Disebutkan">Tidak Disebutkan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="affiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliation</FormLabel>
              <FormControl>
                <Textarea placeholder="Your institution, e.g. 'Simon Fraser University'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center space-x-4">
          <FormField
            control={form.control}
            name="is_reader"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Reader</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_author"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Author</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Form>
  );
}