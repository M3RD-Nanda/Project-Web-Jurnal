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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import React from "react"; // Import React for Fragment
import dynamic from "next/dynamic";
import { updateProfileAdminAction } from "@/actions/users"; // Import Server Action for profile update

// Dynamic import for WalletProfileIntegration to prevent SSR issues
const WalletProfileIntegration = dynamic(
  () =>
    import("@/components/wallet/WalletProfileIntegration").then((mod) => ({
      default: mod.WalletProfileIntegration,
    })),
  {
    loading: () => (
      <div className="h-32 bg-muted/50 animate-pulse rounded-lg border" />
    ),
    ssr: false,
  }
);

// Zod schema for profile form validation
const profileFormSchema = z.object({
  username: z.string().optional(),
  first_name: z.string().min(1, "Nama depan wajib diisi"),
  last_name: z.string().min(1, "Nama belakang wajib diisi"),
  bio_statement: z.string().optional(),
  affiliation: z.string().optional(),
  country: z.string().optional(),
  is_reader: z.boolean(),
  is_author: z.boolean(),
  profile_image_url: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePageClient() {
  const { session, profile, supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      bio_statement: "",
      affiliation: "",
      country: "",
      is_reader: false,
      is_author: false,
      profile_image_url: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  // Populate form with existing profile data
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        bio_statement: profile.bio_statement || "",
        affiliation: profile.affiliation || "",
        country: profile.country || "",
        is_reader: profile.is_reader || false,
        is_author: profile.is_author || false,
        profile_image_url: profile.profile_image_url || "",
      });
    }
  }, [profile, form]);

  async function onSubmit(values: ProfileFormValues) {
    setLoading(true);

    const profileData = {
      username: values.username,
      bio_statement: values.bio_statement,
      affiliation: values.affiliation,
      country: values.country,
      is_reader: values.is_reader,
      is_author: values.is_author,
      profile_image_url: values.profile_image_url,
      first_name: values.first_name,
      last_name: values.last_name,
    };

    const authMetadata = {
      first_name: values.first_name,
      last_name: values.last_name,
    };

    // Get authenticated user ID safely
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Authentication error. Please login again.");
      setLoading(false);
      return;
    }

    const { error } = await updateProfileAdminAction(
      user.id,
      profileData,
      authMetadata
    );

    if (error) {
      toast.error(`Gagal memperbarui profil: ${error.message}`);
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profil berhasil diperbarui!");
      // No need to call supabase.auth.updateUser directly here, as it's handled by the server action
    }
    setLoading(false);
  }

  if (!session) {
    return null;
  }

  return (
    <StaticContentPage title="Profil Pengguna">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Perbarui informasi profil dan preferensi akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Depan *</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama depan" {...field} />
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
                          <Input
                            placeholder="Masukkan nama belakang"
                            {...field}
                          />
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
                        <Input placeholder="Masukkan username" {...field} />
                      </FormControl>
                      <FormDescription>
                        Username unik untuk identifikasi akun Anda
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio_statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ceritakan tentang diri Anda..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Deskripsi singkat tentang diri Anda
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="affiliation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Afiliasi</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Universitas/Institusi"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Institusi atau organisasi tempat Anda berafiliasi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Negara</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih negara" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="indonesia">Indonesia</SelectItem>
                            <SelectItem value="malaysia">Malaysia</SelectItem>
                            <SelectItem value="singapore">Singapore</SelectItem>
                            <SelectItem value="thailand">Thailand</SelectItem>
                            <SelectItem value="philippines">
                              Philippines
                            </SelectItem>
                            <SelectItem value="vietnam">Vietnam</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="profile_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Foto Profil</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/photo.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL gambar untuk foto profil Anda
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preferensi Peran</h3>
                  <div className="space-y-3">
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
                            <FormLabel>Pembaca</FormLabel>
                            <FormDescription>
                              Saya tertarik membaca artikel dan publikasi
                            </FormDescription>
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
                            <FormLabel>Penulis</FormLabel>
                            <FormDescription>
                              Saya ingin mengirimkan artikel untuk publikasi
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Wallet Integration Card */}
        <WalletProfileIntegration />
      </div>
    </StaticContentPage>
  );
}
