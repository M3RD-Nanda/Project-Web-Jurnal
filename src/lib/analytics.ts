import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale"; // Import Indonesian locale
import { logError, logSupabaseQuery } from "@/lib/debug";

export interface DailyVisitData {
  date: string; // Format day name (e.g., "Sen", "Sel")
  visitors: number;
  fullDate?: string; // Full date for tooltip
}

export interface VisitorStats {
  totalToday: number;
  totalWeek: number;
  percentageChange: number;
  trend: "up" | "down" | "stable";
}

export interface TopPage {
  path: string;
  visits: number;
  percentage: number;
}

export async function getDailyVisits(
  days: number = 7
): Promise<DailyVisitData[]> {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    // Use proper date boundaries to avoid timezone issues
    const startDateStr = format(
      startOfDay(startDate),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );
    const endDateStr = format(
      endOfDay(endDate),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );

    console.log(
      `[Analytics] Fetching visits from ${startDateStr} to ${endDateStr}`
    );

    // Use aggregated query for better performance
    const query = supabase.rpc("get_daily_visit_counts", {
      start_date: startDateStr,
      end_date: endDateStr,
    });

    const queryResult = await query;
    const { data, error } = queryResult;

    // Log query results for debugging
    logSupabaseQuery(
      "get_daily_visit_counts",
      { startDate: startDateStr, endDate: endDateStr },
      queryResult
    );

    if (error) {
      logError(error, "getDailyVisits");
      console.error("Error fetching daily visits:", error);
      // Fallback to simple query if RPC fails
      return await getDailyVisitsSimple(days);
    }

    // Process aggregated data from stored procedure
    const aggregatedData = data || [];
    const dailyCounts: { [key: string]: number } = {};

    aggregatedData.forEach((item: any) => {
      const dateKey = format(new Date(item.visit_date), "yyyy-MM-dd");
      dailyCounts[dateKey] = parseInt(item.visit_count) || 0;
    });

    // Generate data for all days in the range, even if no visits
    const dailyData: DailyVisitData[] = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      const dateKey = format(date, "yyyy-MM-dd");
      const fullDate = format(date, "dd MMM yyyy", { locale: id });

      // Use Indonesian locale for day names
      const dayName = format(date, "EEE", { locale: id });

      dailyData.push({
        date: dayName, // Use day name for chart X-axis
        visitors: dailyCounts[dateKey] || 0,
        fullDate: fullDate, // Full date for tooltip
      });
    }

    console.log(
      `[Analytics] Successfully processed ${dailyData.length} days of data`
    );
    return dailyData;
  } catch (error) {
    logError(error, "getDailyVisits");
    console.error("Error in getDailyVisits:", error);

    // Fallback to simple query
    try {
      return await getDailyVisitsSimple(days);
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      // Return mock data in case of error to prevent UI from breaking
      console.log("[Analytics] Returning mock data due to error");
      return generateMockVisitData(days);
    }
  }
}

// Fallback function using simple query
async function getDailyVisitsSimple(
  days: number = 7
): Promise<DailyVisitData[]> {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const startDateStr = format(startDate, "yyyy-MM-dd");
  const endDateStr = format(endDate, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("page_visits")
    .select("visited_at")
    .gte("visited_at", startDateStr)
    .lte("visited_at", endDateStr)
    .order("visited_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch visits: ${error.message}`);
  }

  const visits = data || [];
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

  const dailyData: DailyVisitData[] = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    const dateKey = format(date, "yyyy-MM-dd");
    const fullDate = format(date, "dd MMM yyyy", { locale: id });
    const dayName = format(date, "EEE", { locale: id });

    dailyData.push({
      date: dayName,
      visitors: dailyCounts[dateKey] || 0,
      fullDate: fullDate,
    });
  }

  return dailyData;
}

// Get visitor statistics for dashboard
export async function getVisitorStats(): Promise<VisitorStats> {
  try {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const weekAgo = subDays(today, 7);

    // Get today's visits
    const todayStart = format(
      startOfDay(today),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );
    const todayEnd = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const { data: todayData, error: todayError } = await supabase
      .from("page_visits")
      .select("id", { count: "exact" })
      .gte("visited_at", todayStart)
      .lte("visited_at", todayEnd);

    // Get yesterday's visits for comparison
    const yesterdayStart = format(
      startOfDay(yesterday),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );
    const yesterdayEnd = format(
      endOfDay(yesterday),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );

    const { data: yesterdayData, error: yesterdayError } = await supabase
      .from("page_visits")
      .select("id", { count: "exact" })
      .gte("visited_at", yesterdayStart)
      .lte("visited_at", yesterdayEnd);

    // Get week's visits
    const weekStart = format(
      startOfDay(weekAgo),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    );

    const { data: weekData, error: weekError } = await supabase
      .from("page_visits")
      .select("id", { count: "exact" })
      .gte("visited_at", weekStart)
      .lte("visited_at", todayEnd);

    if (todayError || yesterdayError || weekError) {
      console.error("Error fetching visitor stats:", {
        todayError,
        yesterdayError,
        weekError,
      });
      return {
        totalToday: 0,
        totalWeek: 0,
        percentageChange: 0,
        trend: "stable",
      };
    }

    const totalToday = todayData?.length || 0;
    const totalYesterday = yesterdayData?.length || 0;
    const totalWeek = weekData?.length || 0;

    // Calculate percentage change
    const percentageChange =
      totalYesterday > 0
        ? ((totalToday - totalYesterday) / totalYesterday) * 100
        : totalToday > 0
        ? 100
        : 0;

    // Determine trend
    let trend: "up" | "down" | "stable" = "stable";
    if (percentageChange > 5) trend = "up";
    else if (percentageChange < -5) trend = "down";

    return {
      totalToday,
      totalWeek,
      percentageChange: Math.round(percentageChange * 10) / 10, // Round to 1 decimal
      trend,
    };
  } catch (error) {
    console.error("Error in getVisitorStats:", error);
    return {
      totalToday: 0,
      totalWeek: 0,
      percentageChange: 0,
      trend: "stable",
    };
  }
}

// Fallback function to generate mock data if the API call fails
function generateMockVisitData(days: number = 7): DailyVisitData[] {
  const endDate = new Date();
  const result: DailyVisitData[] = [];

  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    const dayName = format(date, "EEE", { locale: id });
    const fullDate = format(date, "dd MMM yyyy", { locale: id });

    // Generate random number between 5-15 for mock data
    const randomVisitors = Math.floor(Math.random() * 10) + 5;

    result.push({
      date: dayName,
      visitors: randomVisitors,
      fullDate: fullDate,
    });
  }

  return result;
}

// Get real-time visitor count for current hour
export async function getCurrentHourVisitors(): Promise<number> {
  try {
    const now = new Date();
    const hourStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0
    );
    const hourEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      59,
      59
    );

    const startStr = format(hourStart, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const endStr = format(hourEnd, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const { data, error } = await supabase
      .from("page_visits")
      .select("id", { count: "exact" })
      .gte("visited_at", startStr)
      .lte("visited_at", endStr);

    if (error) {
      console.error("Error fetching current hour visitors:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error in getCurrentHourVisitors:", error);
    return 0;
  }
}

// Get visitor count for specific time periods
export async function getVisitorCountByPeriod(
  period: "hour" | "day" | "week" | "month"
): Promise<number> {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "hour":
        startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case "day":
        startDate = startOfDay(now);
        break;
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subDays(now, 30);
        break;
      default:
        startDate = startOfDay(now);
    }

    const startStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const endStr = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const { data, error } = await supabase
      .from("page_visits")
      .select("id", { count: "exact" })
      .gte("visited_at", startStr)
      .lte("visited_at", endStr);

    if (error) {
      console.error(`Error fetching ${period} visitors:`, error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error(`Error in getVisitorCountByPeriod(${period}):`, error);
    return 0;
  }
}

// Get top pages by visit count
export async function getTopPages(days: number = 7): Promise<TopPage[]> {
  try {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const startStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const endStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    logSupabaseQuery("getTopPages", { startStr, endStr, days });

    const { data, error } = await supabase
      .from("page_visits")
      .select("path")
      .gte("visited_at", startStr)
      .lte("visited_at", endStr);

    if (error) {
      console.error("Error fetching top pages:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Count visits per page
    const pathCounts: Record<string, number> = {};
    let totalVisits = 0;

    data.forEach((visit) => {
      const path = visit.path || "/";
      pathCounts[path] = (pathCounts[path] || 0) + 1;
      totalVisits++;
    });

    // Convert to array and sort by visits
    const sortedPages = Object.entries(pathCounts)
      .map(([path, visits]) => ({
        path,
        visits,
        percentage: totalVisits > 0 ? (visits / totalVisits) * 100 : 0,
      }))
      .sort((a, b) => b.visits - a.visits);

    return sortedPages;
  } catch (error) {
    console.error("Error in getTopPages:", error);
    return [];
  }
}
