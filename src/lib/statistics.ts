// src/lib/statistics.ts

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