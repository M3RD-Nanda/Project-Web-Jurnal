import { supabaseAdmin } from "@/integrations/supabase/server"; // Menggunakan supabaseAdmin

export interface Issue {
  id: string;
  volume: number;
  number: number;
  year: number;
  publicationDate: string;
  description: string | null;
}

export async function getAllIssues(): Promise<Issue[]> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from('issues')
    .select('*')
    .order('year', { ascending: false })
    .order('number', { ascending: false });

  if (error) {
    console.error("Error fetching all issues:", error);
    return [];
  }

  if (data) {
    return data.map(item => ({
      id: item.id,
      volume: item.volume,
      number: item.number,
      year: item.year,
      publicationDate: item.publication_date,
      description: item.description,
    }));
  }
  return [];
}

export async function getIssueById(id: string): Promise<Issue | undefined> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching issue by ID:", error);
    return undefined;
  }

  if (data) {
    return {
      id: data.id,
      volume: data.volume,
      number: data.number,
      year: data.year,
      publicationDate: data.publication_date,
      description: data.description,
    };
  }
  return undefined;
}

export async function getLatestIssue(): Promise<Issue | undefined> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from('issues')
    .select('*')
    .order('publication_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching latest issue:", error);
    return undefined;
  }

  if (data) {
    return {
      id: data.id,
      volume: data.volume,
      number: data.number,
      year: data.year,
      publicationDate: data.publication_date,
      description: data.description,
    };
  }
  return undefined;
}

export async function insertIssue(issue: Omit<Issue, 'id'>): Promise<{ data: Issue | null; error: Error | null }> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk INSERT
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
    console.error("Error inserting issue:", error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Issue, error: null };
}

export async function updateIssue(id: string, issue: Partial<Omit<Issue, 'id'>>): Promise<{ data: Issue | null; error: Error | null }> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk UPDATE
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
    console.error(`Error updating issue with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Issue, error: null };
}

export async function deleteIssue(id: string): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk DELETE
    .from('issues')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting issue with ID ${id}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}