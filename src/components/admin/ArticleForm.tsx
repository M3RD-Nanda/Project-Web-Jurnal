"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns/format";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { id as dateFnsIdLocale } from "date-fns/locale/id";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Article } from "@/lib/articles";
import { createArticleAction, updateArticleAction } from "@/actions/articles"; // Import Server Actions
import { getIssuesForArticleForm } from "@/actions/issues-data"; // Import the new Server Action

const articleFormSchema = z.object({
  title: z
    .string()
    .min(1, "Judul wajib diisi.")
    .max(500, "Judul terlalu panjang."),
  authors: z.string().min(1, "Penulis wajib diisi."),
  abstract: z
    .string()
    .min(1, "Abstrak wajib diisi.")
    .max(2000, "Abstrak terlalu panjang."),
  fullContent: z.string().min(1, "Konten lengkap wajib diisi."), // Reverted to string
  publicationDate: z.date({
    required_error: "Tanggal publikasi wajib diisi.",
  }),
  keywords: z.string().optional(), // Will be comma-separated string
  issueId: z.string().nullable().optional(), // UUID of the issue, can be null
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  initialData?: Article | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ArticleForm({
  initialData,
  onSuccess,
  onCancel,
}: ArticleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issues, setIssues] = useState<any[]>([]); // Use any[] for now, or import Issue interface
  const [issuesLoading, setIssuesLoading] = useState(true);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          authors: initialData.authors,
          abstract: initialData.abstract,
          fullContent: initialData.fullContent,
          publicationDate: new Date(initialData.publicationDate),
          keywords: initialData.keywords?.join(", ") || "",
          issueId: initialData.issueId || "null-issue", // Map null to "null-issue" for the select
        }
      : {
          title: "",
          authors: "",
          abstract: "",
          fullContent: "",
          publicationDate: new Date(),
          keywords: "",
          issueId: "null-issue", // Default to "Tidak Ada Edisi"
        },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchIssues = async () => {
      setIssuesLoading(true);
      // Call the new Server Action to fetch issues
      const fetchedIssues = await getIssuesForArticleForm();
      setIssues(fetchedIssues);
      setIssuesLoading(false);
    };
    fetchIssues();
  }, []);

  async function onSubmit(values: ArticleFormValues) {
    setIsSubmitting(true);
    let resultError: string | null = null;

    const keywordsArray =
      values.keywords && values.keywords.trim()
        ? values.keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : [];

    const articleData = {
      title: values.title,
      authors: values.authors,
      abstract: values.abstract,
      fullContent: values.fullContent, // This is now a plain string
      publicationDate: format(values.publicationDate, "yyyy-MM-dd"),
      keywords: keywordsArray,
      issueId:
        (values.issueId === "null-issue" ? null : values.issueId) ?? null, // Convert "null-issue" to null, and any undefined to null
    };

    if (initialData) {
      const { error } = await updateArticleAction(initialData.id, articleData);
      resultError = error;
    } else {
      const { error } = await createArticleAction(articleData);
      resultError = error;
    }

    if (resultError) {
      toast.error(`Gagal menyimpan artikel: ${resultError}`);
    } else {
      toast.success(
        `Artikel berhasil ${initialData ? "diperbarui" : "ditambahkan"}!`
      );
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
                <Input placeholder="Judul Artikel" {...field} />
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
                <Input
                  placeholder="Nama Penulis (pisahkan dengan koma jika lebih dari satu)"
                  {...field}
                />
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
                <Textarea
                  placeholder="Abstrak artikel..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
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
                <Textarea
                  placeholder="Tulis konten lengkap artikel di sini..."
                  className="resize-y min-h-[200px]"
                  {...field}
                />
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
                        format(field.value, "PPP", { locale: dateFnsIdLocale })
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
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata Kunci (Pisahkan dengan koma)</FormLabel>
              <FormControl>
                <Input placeholder="keyword1, keyword2, keyword3" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="issueId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Edisi Terkait (Opsional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || "null-issue"}
                disabled={issuesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        issuesLoading ? "Memuat edisi..." : "Pilih Edisi"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null-issue">Tidak Ada Edisi</SelectItem>{" "}
                  {/* Changed value from "" to "null-issue" */}
                  {issues.map((issue) => (
                    <SelectItem key={issue.id} value={issue.id}>
                      Vol. {issue.volume}, No. {issue.number} ({issue.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Simpan Perubahan" : "Tambah Artikel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
