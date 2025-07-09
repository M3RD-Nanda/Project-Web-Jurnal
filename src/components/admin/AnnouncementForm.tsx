"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { id as dateFnsIdLocale } from "date-fns/locale"; // Rename 'id' to avoid potential conflicts

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Announcement, insertAnnouncement, updateAnnouncement } from "@/lib/announcements";

const announcementFormSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi.").max(255, "Judul terlalu panjang."),
  description: z.string().max(1000, "Deskripsi terlalu panjang.").optional(),
  publicationDate: z.date({
    required_error: "Tanggal publikasi wajib diisi.",
  }),
  link: z.string().url("Link tidak valid.").or(z.literal("")).optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

interface AnnouncementFormProps {
  initialData?: Announcement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({ initialData, onSuccess, onCancel }: AnnouncementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementFormValues>({ // Explicitly type useForm
    resolver: zodResolver(announcementFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? undefined, // Convert null to undefined for Zod optional()
          publicationDate: new Date(initialData.publicationDate),
          link: initialData.link ?? undefined, // Convert null to undefined for Zod optional()
        }
      : {
          title: "",
          description: undefined, // Ensure default is undefined for optional fields
          publicationDate: new Date(),
          link: undefined, // Ensure default is undefined for optional fields
        },
    mode: "onChange",
  });

  async function onSubmit(values: AnnouncementFormValues) { // Explicitly type values
    setIsSubmitting(true);
    let error: Error | null = null;

    // Convert undefined to null for Supabase insertion/update
    const dataToSave = {
      title: values.title,
      description: values.description || null,
      publicationDate: format(values.publicationDate, 'yyyy-MM-dd'),
      link: values.link || null,
    };

    if (initialData) {
      // Update existing announcement
      const { error: updateError } = await updateAnnouncement(initialData.id, dataToSave);
      error = updateError;
    } else {
      // Insert new announcement
      const { error: insertError } = await insertAnnouncement(dataToSave);
      error = insertError;
    }

    if (error) {
      toast.error(`Gagal menyimpan pengumuman: ${error.message}`);
    } else {
      toast.success(`Pengumuman berhasil ${initialData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul</FormLabel>
              <FormControl>
                <Input placeholder="Judul Pengumuman" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat pengumuman..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicationDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Publikasi</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: dateFnsIdLocale }) // Use renamed import
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/detail" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Simpan Perubahan" : "Tambah Pengumuman"}
          </Button>
        </div>
      </form>
    </Form>
  );
}