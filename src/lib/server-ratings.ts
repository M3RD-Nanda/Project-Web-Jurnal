"use server";

import { supabaseAdmin } from "@/integrations/supabase/server";
import { Rating } from "./ratings"; // Import interface Rating

export async function insertRatingServer(stars: number, name: string | null, comment: string | null, userId: string | null): Promise<{ data: Rating | null; error: Error | null }> {
  const { data, error } = await supabaseAdmin
    .from('ratings')
    .insert({ stars, name, comment, user_id: userId })
    .select()
    .single(); // Use .single() as we expect one row back

  if (error) {
    console.error("Error inserting rating (server):", error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as Rating, error: null };
}