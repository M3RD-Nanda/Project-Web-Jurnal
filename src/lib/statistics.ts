import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase
    .from('articles_per_year')
    .select('*')
    .order('year', { ascending: true });

  if (error) {
    console.error("Error fetching articles per year:", error);
    return [];
  }
  return data || [];
}

export async function getAcceptanceRates(): Promise<AcceptanceRateData[]> {
  const { data, error } = await supabase
    .from('acceptance_rates')
    .select('*');

  if (error) {
    console.error("Error fetching acceptance rates:", error);
    return [];
  }
  return data || [];
}

export async function getCitations(): Promise<CitationData[]> {
  const { data, error } = await supabase
    .from('citations')
    .select('*')
    .order('id', { ascending: true }); // Assuming 'id' or a specific order column for months

  if (error) {
    console.error("Error fetching citations:", error);
    return [];
  }
  return data || [];
}