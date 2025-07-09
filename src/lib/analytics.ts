import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export interface DailyVisitData {
  date: string; // Format YYYY-MM-DD
  visitors: number;
}

export async function getDailyVisits(days: number = 7): Promise<DailyVisitData[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1); // Get data for the last 'days' days

  const { data, error } = await supabase
    .from('page_visits')
    .select('visited_at')
    .gte('visited_at', format(startDate, 'yyyy-MM-dd'))
    .lte('visited_at', format(endDate, 'yyyy-MM-dd'))
    .order('visited_at', { ascending: true });

  if (error) {
    console.error("Error fetching daily visits:", error);
    return [];
  }

  const dailyCounts: { [key: string]: number } = {};
  data.forEach(visit => {
    const dateKey = format(new Date(visit.visited_at), 'yyyy-MM-dd');
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  });

  // Generate data for all days in the range, even if no visits
  const result: DailyVisitData[] = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'EEE'); // e.g., "Sen", "Sel"
    result.push({
      date: dayName, // Use day name for chart X-axis
      visitors: dailyCounts[dateKey] || 0,
    });
  }

  return result;
}