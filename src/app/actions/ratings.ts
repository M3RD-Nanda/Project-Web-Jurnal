"use server";

import { revalidatePath } from "next/cache";
import { insertRatingServer } from "@/lib/server-ratings"; // Import the new server-side insert function
import { Rating } from "@/lib/ratings"; // Import Rating interface

export async function submitRating(stars: number, name: string | null, comment: string | null, userId: string | null): Promise<{ success: boolean; data?: Rating | null; error?: string }> {
  const { data, error } = await insertRatingServer(stars, name, comment, userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate the /ratings page to show the new rating
  revalidatePath("/ratings");

  return { success: true, data };
}