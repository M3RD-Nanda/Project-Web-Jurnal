import { supabase } from "@/integrations/supabase/client";

export interface Rating {
  id: string;
  stars: number;
  name: string | null;
  comment: string | null;
  created_at: string;
  user_id: string | null;
}

export async function insertRating(stars: number, name: string | null, comment: string | null, userId: string | null): Promise<{ data: Rating | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('ratings')
    .insert({ stars, name, comment, user_id: userId })
    .select(); // This should return the inserted row(s)

  if (error) {
    console.error("Error inserting rating:", error);
    return { data: null, error: new Error(error.message) };
  }

  // If data is null or an empty array, it means the insert didn't return the expected row.
  // This could happen if RLS silently prevents the select part, or other issues.
  if (!data || data.length === 0) {
    console.error("Insert rating operation completed without error, but no data was returned. This might indicate an RLS issue or a problem with the insert statement.");
    return { data: null, error: new Error("Rating could not be saved. Please try again.") };
  }

  return { data: data[0] as Rating, error: null };
}

export async function getAllRatings(): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all ratings:", error);
    return [];
  }
  return data || [];
}