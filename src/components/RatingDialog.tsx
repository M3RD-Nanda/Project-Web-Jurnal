"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSupabase } from "@/components/SessionProvider";
import { insertRating } from "@/lib/ratings";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ratingFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi.").max(100, "Nama terlalu panjang.").optional(),
  comment: z.string().max(500, "Komentar terlalu panjang.").optional(),
});

type RatingFormValues = z.infer<typeof ratingFormSchema>;

interface RatingDialogProps {
  children: React.ReactNode;
}

export function RatingDialog({ children }: RatingDialogProps) {
  const { session } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      name: session?.user?.user_metadata?.first_name || session?.user?.email?.split('@')[0] || "",
      comment: "",
    },
  });

  React.useEffect(() => {
    if (session) {
      form.setValue("name", session.user?.user_metadata?.first_name || session.user?.email?.split('@')[0] || "");
    } else {
      form.setValue("name", "");
    }
  }, [session, form]);

  const handleStarClick = (selectedStars: number) => {
    setStars(selectedStars);
  };

  const onSubmit = async (values: RatingFormValues) => {
    if (stars === 0) {
      toast.error("Harap berikan rating bintang.");
      return;
    }

    setIsSubmitting(true);
    const userId = session?.user?.id || null;
    const { error } = await insertRating(stars, values.name || null, values.comment || null, userId);

    if (error) {
      toast.error(`Gagal mengirim rating: ${error.message}`);
    } else {
      toast.success("Terima kasih atas rating Anda!");
      setIsOpen(false);
      setStars(0);
      form.reset(); // Reset form after successful submission
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Beri Rating Website Kami</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda dengan memberikan rating dan komentar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((starCount) => (
                <Star
                  key={starCount}
                  className={cn(
                    "h-8 w-8 cursor-pointer transition-colors",
                    stars >= starCount ? "fill-yellow-400 text-yellow-400" : "fill-muted stroke-muted-foreground"
                  )}
                  onClick={() => handleStarClick(starCount)}
                />
              ))}
            </div>
            {stars === 0 && <p className="text-center text-sm text-destructive">Harap pilih jumlah bintang.</p>}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Anda (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Anonim" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentar (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tulis komentar Anda di sini..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Mengirim..." : "Kirim Rating"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}