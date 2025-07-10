"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/integrations/supabase/server";
import { Issue } from "@/lib/issues";

export async function createIssueAction(issue: Omit<Issue, 'id'>): Promise<{ data: Issue | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('issues')
    .insert({
      volume: issue.volume,
      number: issue.number,
      year: issue.year,
      publication_date: issue.publicationDate,
      description: issue.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Server Action: Error inserting issue:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/issues");
  revalidatePath("/current");
  revalidatePath("/archives");
  return { data: data as Issue, error: null };
}

export async function updateIssueAction(id: string, issue: Partial<Omit<Issue, 'id'>>): Promise<{ data: Issue | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('issues')
    .update({
      volume: issue.volume,
      number: issue.number,
      year: issue.year,
      publication_date: issue.publicationDate,
      description: issue.description,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Server Action: Error updating issue with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/issues");
  revalidatePath("/current");
  revalidatePath("/archives");
  revalidatePath(`/archives/${id}`); // Revalidate specific issue page
  return { data: data as Issue, error: null };
}

export async function deleteIssueAction(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from('issues')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Server Action: Error deleting issue with ID ${id}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/issues");
  revalidatePath("/current");
  revalidatePath("/archives");
  return { success: true, error: null };
}