"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import React from "react"; // Import React for Fragment

// Zod schema for profile form validation
const profileFormSchema = z.object({
  username: z.string().optional(),
  salutation: z.string().optional(),
  first_name: z.string().min(1, "Nama depan wajib diisi."),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Nama belakang wajib diisi."),
  initials: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan", "Lainnya", "Tidak Disebutkan"]).optional(),
  affiliation: z.string().optional(),
  signature: z.string().optional(),
  email: z.string().email("Email tidak valid.").min(1, "Email wajib diisi."),
  orcid_id: z.string().optional(),
  url: z.string().url("URL tidak valid.").optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  mailing_address: z.string().optional(),
  bio_statement: z.string().optional(),
  country: z.string().optional(),
  is_reader: z.boolean(), // Changed from .default(true)
  is_author: z.boolean(), // Changed from .default(false)
  profile_image_url: z.string().url("URL gambar profil tidak valid.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      salutation: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      initials: "",
      gender: "Tidak Disebutkan",
      affiliation: "",
      signature: "",
      email: "",
      orcid_id: "",
      url: "",
      phone: "",
      fax: "",
      mailing_address: "",
      bio_statement: "",
      country: "",
      is_reader: true, // Explicit default
      is_author: false, // Explicit default
      profile_image_url: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      toast.info("Anda harus login untuk mengakses halaman profil.");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        toast.error(`Gagal memuat profil: ${error.message}`);
        console.error("Error fetching profile:", error);
      } else if (data) {
        // Ensure all fields are explicitly handled, even if null from DB
        form.reset({
          username: data.username ?? "",
          salutation: data.salutation ?? "",
          first_name: data.first_name ?? "",
          middle_name: data.middle_name ?? "",
          last_name: data.last_name ?? "",
          initials: data.initials ?? "",
          gender: (data.gender as ProfileFormValues['gender']) ?? "Tidak Disebutkan",
          affiliation: data.affiliation ?? "",
          signature: data.signature ?? "",
          email: session.user.email ?? "", // Email from auth.users
          orcid_id: data.orcid_id ?? "",
          url: data.url ?? "",
          phone: data.phone ?? "",
          fax: data.fax ?? "",
          mailing_address: data.mailing_address ?? "",
          bio_statement: data.bio_statement ?? "",
          country: data.country ?? "",
          is_reader: data.is_reader, // No ?? true needed if DB is NOT NULL
          is_author: data.is_author, // No ?? false needed if DB is NOT NULL
          profile_image_url: data.profile_image_url ?? "",
        });
      } else {
        // If no profile exists, initialize with user's email and default names from auth.users
        form.reset({
          email: session.user.email ?? "",
          first_name: session.user.user_metadata?.first_name ?? "",
          last_name: session.user.user_metadata?.last_name ?? "",
          is_reader: true, // Explicit default
          is_author: false, // Explicit default
          // Ensure all other optional fields are explicitly set to empty string or default
          username: "",
          salutation: "",
          middle_name: "",
          initials: "",
          gender: "Tidak Disebutkan",
          affiliation: "",
          signature: "",
          orcid_id: "",
          url: "",
          phone: "",
          fax: "",
          mailing_address: "",
          bio_statement: "",
          country: "",
          profile_image_url: "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session, router, supabase, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!session) {
      toast.error("Anda tidak terautentikasi.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: session.user.id,
        username: values.username || null, // Store empty strings as null in DB if optional
        salutation: values.salutation || null,
        first_name: values.first_name, // Required
        middle_name: values.middle_name || null,
        last_name: values.last_name, // Required
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
      }, { onConflict: 'id' }); // Use onConflict to handle both insert and update

    if (error) {
      toast.error(`Gagal memperbarui profil: ${error.message}`);
      console.error("Error updating profile:", error);
    } else {
      toast.success("Profil berhasil diperbarui!");
      // Optionally, update user_metadata in auth.users if names are changed
      await supabase.auth.updateUser({
        data: {
          first_name: values.first_name,
          last_name: values.last_name,
        }
      });
    }
    setLoading(false);
  }

  if (!session) {
    return null; // Redirect handled by useEffect
  }

  return (
    <StaticContentPage title="Edit Profil">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Edit Profil</CardTitle>
          <CardDescription className="text-center text-muted-foreground mt-2">
            Perbarui informasi pribadi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Memuat profil...</p>
            </div>
          )}
          {!loading && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salutation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salutation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <React.Fragment>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Salutation" />
                              </SelectTrigger>
                            </React.Fragment>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="initials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initials</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
                        </FormControl>
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
                            <React.Fragment>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Gender" />
                              </SelectTrigger>
                            </React.Fragment>
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
                        <React.Fragment>
                          <Textarea placeholder="Your institution, e.g. 'Simon Fraser University'" {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Textarea {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Input type="email" disabled {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormDescription>Email tidak dapat diubah dari sini.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orcid_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ORCID iD</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Input {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormDescription>
                        ORCID iDs can only be assigned by the{" "}
                        <a href="https://orcid.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          ORCID Registry
                        </a>
                        . You must conform to their standards for expressing ORCID iDs, and include the full URI (e.g. http://orcid.org/0000-0002-1825-0097).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Input type="url" {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input type="tel" {...field} />
                          </React.Fragment>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fax</FormLabel>
                        <FormControl>
                          <React.Fragment>
                            <Input {...field} />
                          </React.Fragment>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mailing_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mailing Address</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Textarea {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Input {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="is_reader"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <React.Fragment>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </React.Fragment>
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
                            <React.Fragment>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </React.Fragment>
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Author</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name="bio_statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio Statement</FormLabel>
                      <FormControl>
                        <React.Fragment>
                          <Textarea {...field} />
                        </React.Fragment>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile Image Section - Placeholder for now */}
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input type="file" disabled />
                    <Button type="button" disabled>Upload</Button>
                  </div>
                  <FormDescription>
                    Fitur upload gambar profil akan segera hadir.
                  </FormDescription>
                </FormItem>

                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </StaticContentPage>
  );
}