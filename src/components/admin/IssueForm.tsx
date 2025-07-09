"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { id as dateFnsIdLocale } from "date-fns/locale";

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
import { Issue, insertIssue, updateIssue } from "@/lib/issues";

const issueFormSchema = z.object({
  volume: z.coerce.number().min(1, "Volume wajib diisi dan harus angka positif."),
  number: z.coerce.number().min(1, "Nomor wajib diisi dan harus angka positif."),
  year: z.coerce.number().min(1900, "Tahun tidak valid.").max(2100, "Tahun tidak valid."),
  publicationDate: z.date({
    required_error: "Tanggal publikasi wajib diisi.",
  }),
  description: z.string().max(1000, "Deskripsi terlalu panjang.").optional(),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

interface IssueFormProps {
  initialData?: Issue | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IssueForm({ initialData, onSuccess, onCancel }: IssueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: initialData
      ? {
          volume: initialData.volume,
          number: initialData.number,
          year: initialData.year,
          publicationDate: new Date(initialData.publicationDate),
          description: initialData.description ?? undefined,
        }
      : {
          volume: 1,
          number: 1,
          year: new Date().getFullYear(),
          publicationDate: new Date(),
          description: undefined,
        },
    mode: "onChange",
  });

  async function onSubmit(values: IssueFormValues) {
    setIsSubmitting(true);
    let error: Error | null = null;

    const issueData = {
      volume: values.volume,
      number: values.number,
      year: values.year,
      publicationDate: format(values.publicationDate, 'yyyy-MM-dd'),
      description: values.description || null,
    };

    if (initialData) {
      const { error: updateError } = await updateIssue(initialData.id, issueData);
      error = updateError;
    } else {
      const { error: insertError } = await insertIssue(issueData);
      error = insertError;
    }

    if (error) {
      toast.error(`Gagal menyimpan edisi: ${error.message}`);
    } else {
      toast.success(`Edisi berhasil ${initialData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat edisi..." className="resize-none" {...field} />
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
            {initialData ? "Simpan Perubahan" : "Tambah Edisi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}