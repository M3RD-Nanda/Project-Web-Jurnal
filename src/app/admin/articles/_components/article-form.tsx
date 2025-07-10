"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Article, createArticle, updateArticle } from "@/lib/articles";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const formSchema = z.object({
  title: z.string().min(1, { message: "Judul harus diisi." }),
  authors: z.string().min(1, { message: "Penulis harus diisi." }),
  abstract: z.string().min(1, { message: "Abstrak harus diisi." }),
  fullContent: z.string().min(1, { message: "Konten lengkap harus diisi." }),
  publicationDate: z.string().min(1, { message: "Tanggal publikasi harus diisi." }),
  keywords: z.string().min(1, { message: "Kata kunci harus diisi (pisahkan dengan koma)." }),
  issue_id: z.string().optional().nullable(), // Assuming issue_id is a string UUID
});

type ArticleFormValues = z.infer<typeof formSchema>;

interface ArticleFormProps {
  initialData?: Article;
  onSave: () => void;
}

export function ArticleForm({ initialData, onSave }: ArticleFormProps) {
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      authors: initialData?.authors || "",
      abstract: initialData?.abstract || "",
      fullContent: initialData?.fullContent || "",
      publicationDate: initialData?.publicationDate || new Date().toISOString().split('T')[0], // Default to today's date
      keywords: initialData?.keywords?.join(", ") || "",
      issue_id: initialData?.issue_id || "", // Mengubah null menjadi ""
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: ArticleFormValues) {
    setIsSubmitting(true);
    const articleData = {
      ...values,
      keywords: values.keywords.split(",").map(k => k.trim()).filter(k => k.length > 0),
      publicationDate: new Date(values.publicationDate).toISOString().split('T')[0], // Ensure date format
    };

    let result;
    if (initialData) {
      result = await updateArticle(initialData.id, articleData);
    } else {
      result = await createArticle(articleData);
    }

    if (result.error) {
      toast.error(`Gagal menyimpan artikel: ${result.error.message}`);
    } else {
      toast.success("Artikel berhasil disimpan!");
      form.reset();
      onSave();
      window.location.reload(); // Reload to reflect changes in DataTable
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
                <Input placeholder="Judul artikel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="authors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Penulis</FormLabel>
              <FormControl>
                <Input placeholder="Nama penulis (pisahkan dengan koma)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="publicationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Publikasi</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="abstract"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abstrak</FormLabel>
              <FormControl>
                <Textarea placeholder="Ringkasan artikel" {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullContent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konten Lengkap</FormLabel>
              <FormControl>
                <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  className="h-64 mb-12" // Adjust height and add margin-bottom to prevent overlap
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata Kunci</FormLabel>
              <FormControl>
                <Input placeholder="Kata kunci (pisahkan dengan koma)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issue_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Edisi (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="UUID Edisi terkait" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Artikel"}
        </Button>
      </form>
    </Form>
  );
}