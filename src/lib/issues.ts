import { supabaseAdmin } from "@/integrations/supabase/server"; // Menggunakan supabaseAdmin
import { validateUUIDWithLogging } from "@/lib/uuid-validation";

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
    .from("issues")
    .select("*")
    .order("year", { ascending: false })
    .order("number", { ascending: false });

  if (error) {
    console.error("Error fetching all issues:", error);
    return [];
  }

  if (data) {
    return data.map((item) => ({
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
  // Validate UUID format before making database query
  if (!validateUUIDWithLogging(id, "getIssueById")) {
    return undefined;
  }

  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("issues")
    .select("*")
    .eq("id", id)
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
    .from("issues")
    .select("*")
    .order("publication_date", { ascending: false })
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
