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
    .select()
    .single();

  if (error) {
    console.error("Error inserting rating:", error);
    return { data: null, error: new Error(error.message) };
  }
  return { data, error: null };
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