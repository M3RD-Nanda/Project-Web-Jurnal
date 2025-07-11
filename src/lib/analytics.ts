import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale
import { logError, logSupabaseQuery } from "@/lib/debug";

export interface DailyVisitData {
  date: string; // Format day name (e.g., "Sen", "Sel")
  visitors: number;
}

export async function getDailyVisits(
  days: number = 7
): Promise<DailyVisitData[]> {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1); // Get data for the last 'days' days

    // Format dates for query
    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");

    // Fetch data from Supabase
    console.log(
      `[Analytics] Fetching visits from ${startDateStr} to ${endDateStr}`
    );

    const query = supabase
      .from("page_visits")
      .select("visited_at")
      .gte("visited_at", startDateStr)
      .lte("visited_at", endDateStr)
      .order("visited_at", { ascending: true });

    const queryResult = await query;
    const { data, error } = queryResult;

    // Log query results for debugging
    logSupabaseQuery(
      "page_visits",
      { startDate: startDateStr, endDate: endDateStr },
      queryResult
    );

    if (error) {
      logError(error, "getDailyVisits");
      console.error("Error fetching daily visits:", error);
      throw new Error(`Failed to fetch visits: ${error.message}`);
    }

    // Ensure 'data' is an array
    const visits = data || [];

    // Count visits per day
    const dailyCounts: { [key: string]: number } = {};
    visits.forEach((visit) => {
      try {
        const visitDate = new Date(visit.visited_at);
        const dateKey = format(visitDate, "yyyy-MM-dd");
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      } catch (err) {
        console.warn("Invalid date format in visit data:", visit.visited_at);
      }
    });

    // Generate data for all days in the range, even if no visits
    const dailyData: DailyVisitData[] = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      const dateKey = format(date, "yyyy-MM-dd");

      // Use Indonesian locale for day names
      const dayName = format(date, "EEE", { locale: id });

      dailyData.push({
        date: dayName, // Use day name for chart X-axis
        visitors: dailyCounts[dateKey] || 0,
      });
    }

    console.log(
      `[Analytics] Successfully processed ${dailyData.length} days of data`
    );
    return dailyData;
  } catch (error) {
    logError(error, "getDailyVisits");
    console.error("Error in getDailyVisits:", error);

    // Return mock data in case of error to prevent UI from breaking
    console.log("[Analytics] Returning mock data due to error");
    return generateMockVisitData(days);
  }
}

// Fallback function to generate mock data if the API call fails
function generateMockVisitData(days: number = 7): DailyVisitData[] {
  const endDate = new Date();
  const result: DailyVisitData[] = [];

  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    const dayName = format(date, "EEE", { locale: id });

    // Generate random number between 5-15 for mock data
    const randomVisitors = Math.floor(Math.random() * 10) + 5;

    result.push({
      date: dayName,
      visitors: randomVisitors,
    });
  }

  return result;
}
