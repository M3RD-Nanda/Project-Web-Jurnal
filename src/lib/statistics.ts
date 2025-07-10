import { supabaseAdmin } from "@/integrations/supabase/server"; // Menggunakan supabaseAdmin

export interface ArticlesPerYearData {
  year: number;
  articles: number;
}

export interface AcceptanceRateData {
  status: string;
  count: number;
}

export interface CitationData {
  id: string; // Added id for consistent primary key handling
  month: string;
  citations: number;
}

export async function getArticlesPerYear(): Promise<ArticlesPerYearData[]> {
  console.log("Fetching articles per year data...");
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin
    .from('articles_per_year')
    .select('*')
    .order('year', { ascending: true });

  if (error) {
    console.error("Error fetching articles per year:", error);
    return [];
  }
  console.log("Articles per year data fetched:", data);
  return data || [];
}

export async function getAcceptanceRates(): Promise<AcceptanceRateData[]> {
  console.log("Fetching acceptance rates data...");
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin
    .from('acceptance_rates')
    .select('*');

  if (error) {
    console.error("Error fetching acceptance rates:", error);
    return [];
  }
  console.log("Acceptance rates data fetched:", data);
  return data || [];
}

export async function getCitations(): Promise<CitationData[]> {
  console.log("Fetching citations data...");
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin
    .from('citations')
    .select('*')
    .order('id', { ascending: true }); // Assuming 'id' or a specific order column for months

  if (error) {
    console.error("Error fetching citations:", error);
    return [];
  }
  console.log("Citations data fetched:", data);
  return data || [];
}