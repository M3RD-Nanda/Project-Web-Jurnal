// src/lib/statistics.ts
import { supabase } from "@/integrations/supabase/client";

export interface ArticlesPerYearData {
  year: number;
  articles: number;
}

export interface AcceptanceRateData {
  status: string;
  value: number; // This 'value' might be used by Recharts Pie, but 'count' is the actual data
  count: number; // This is the actual count from the DB
}

export interface CitationData {
  id: string; // Assuming an ID for unique keys
  month: string;
  citations: number;
}

// New interfaces for chart component props
export interface ArticlesBarChartProps {
  data: ArticlesPerYearData[];
}

export interface AcceptancePieChartProps {
  data: AcceptanceRateData[];
}

export interface CitationsLineChartProps {
  data: CitationData[];
}

export async function getArticlesPerYear(): Promise<ArticlesPerYearData[]> {
  const { data, error } = await supabase
    .from('articles_per_year')
    .select('year, articles')
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
    .select('status, count')
    .order('status', { ascending: true });

  if (error) {
    console.error("Error fetching acceptance rates:", error);
    return [];
  }
  
  // Filter out English status names if they exist, keeping only Indonesian
  const filteredData = data ? data.filter(item => {
    const lowerStatus = item.status.toLowerCase();
    return lowerStatus === 'diterima' || lowerStatus === 'ditolak';
  }) : [];

  // Map 'count' to 'value' for Recharts Pie component
  return filteredData.map(item => ({ ...item, value: item.count }));
}

export async function getCitations(): Promise<CitationData[]> {
  const { data, error } = await supabase
    .from('citations')
    .select('id, month, citations')
    .order('month', { ascending: true }); // Adjust order if you have a date column

  if (error) {
    console.error("Error fetching citations:", error);
    return [];
  }
  return data || [];
}