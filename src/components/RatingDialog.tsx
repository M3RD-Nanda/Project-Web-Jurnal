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
import { cn } from "@/lib/utils"; // Perbaikan di sini: Mengubah '=>' menjadi 'from'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useSupabase } from "@/components/SessionProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { submitRating } from "@/app/actions/ratings"; // Temporarily disabled to fix build error

const ratingFormSchema = z.object({
  name: z.string().max(100, "Nama terlalu panjang.").optional(),
  comment: z.string().max(500, "Komentar terlalu panjang.").optional(),
});

type RatingFormValues = z.infer<typeof ratingFormSchema>;

interface RatingDialogProps {
  children: React.ReactNode;
}

export function RatingDialog({ children }: RatingDialogProps) {
  const { session, supabase } = useSupabase();
  const [isOpen, setIsOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      name: "",
      comment: "",
    },
  });

  React.useEffect(() => {
    const getUserName = async () => {
      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!error && user) {
          const name =
            user.user_metadata?.first_name || user.email?.split("@")[0] || "";
          setUserName(name);
          form.setValue("name", name);
        }
      } else {
        setUserName("");
        form.setValue("name", "");
      }
    };

    getUserName();
  }, [session, form, supabase]);

  const handleStarClick = (selectedStars: number) => {
    setStars(selectedStars);
  };

  const onSubmit = async (values: RatingFormValues) => {
    if (!session) {
      toast.error("Anda harus login untuk memberi rating.");
      return;
    }

    if (stars === 0) {
      toast.error("Harap berikan rating bintang.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get authenticated user ID safely
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Authentication error. Please login again.");
        setIsSubmitting(false);
        return;
      }

      // Temporarily use direct client-side insert to fix build error
      const { insertRating } = await import("@/lib/ratings");
      const { data, error } = await insertRating(
        stars,
        values.name || null,
        values.comment || null,
        user.id
      );

      if (error) {
        console.error("Rating submission failed:", error);
        toast.error(
          `Gagal mengirim rating: ${
            error.message || "Terjadi kesalahan tidak dikenal."
          }`
        );
      } else if (data) {
        toast.success("Terima kasih atas rating Anda!");
        setIsOpen(false);
        setStars(0);
        form.reset();
        // revalidatePath("/ratings") is handled by the server action
      }
    } catch (e: any) {
      console.error("Unexpected error during rating submission:", e);
      toast.error(
        `Terjadi kesalahan tak terduga: ${e.message || "Silakan coba lagi."}`
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            {!session && (
              <p className="text-center text-sm text-muted-foreground bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-md">
                Anda harus login untuk memberi rating.
              </p>
            )}
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((starCount) => (
                <Star
                  key={starCount}
                  className={cn(
                    "h-8 w-8 cursor-pointer transition-colors",
                    stars >= starCount
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted stroke-muted-foreground"
                  )}
                  onClick={() => handleStarClick(starCount)}
                />
              ))}
            </div>
            {stars === 0 && (
              <p className="text-center text-sm text-destructive">
                Harap pilih jumlah bintang.
              </p>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Anda (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Anonim"
                      {...field}
                      disabled={!session}
                    />
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
                    <Textarea
                      placeholder="Tulis komentar Anda di sini..."
                      className="resize-none"
                      {...field}
                      disabled={!session}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting || !session}
              className="w-full"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Rating"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
