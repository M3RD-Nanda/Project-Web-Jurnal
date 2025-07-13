import { supabase } from "@/integrations/supabase/client";

/**
 * Simple script to completely reset analytics data with realistic values
 */

export async function simpleAnalyticsFix() {
  try {
    // Step 1: Delete ALL existing data

    const { error: deleteError } = await supabase
      .from("page_visits")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000"); // This will delete all records

    if (deleteError) {
      console.error("❌ Failed to delete existing data:", deleteError);
      throw new Error(`Failed to delete existing data: ${deleteError.message}`);
    }

    // Step 2: Add realistic data for the past 6 days (not today)

    const pages = ["/", "/about", "/current", "/archives"];
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    ];

    const realisticData = [];

    // Generate data for past 6 days only (not today)
    for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      // Generate 3-8 visits per day
      const dailyVisits = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < dailyVisits; i++) {
        const hour = Math.floor(Math.random() * 12) + 9; // 9 AM to 9 PM
        const minute = Math.floor(Math.random() * 60);

        const visitTime = new Date(date);
        visitTime.setHours(hour, minute, 0, 0);

        realisticData.push({
          path: pages[Math.floor(Math.random() * pages.length)],
          visited_at: visitTime.toISOString(),
        });
      }
    }

    // Step 3: Insert realistic data
    if (realisticData.length > 0) {
      const { error: insertError } = await supabase
        .from("page_visits")
        .insert(realisticData);

      if (insertError) {
        console.error("❌ Failed to insert realistic data:", insertError);
        throw new Error(
          `Failed to insert realistic data: ${insertError.message}`
        );
      }

      // Successfully inserted realistic records
    }

    // Step 4: Verify the result
    const { data: verifyData, error: verifyError } = await supabase
      .from("page_visits")
      .select("visited_at")
      .order("visited_at", { ascending: false });

    if (verifyError) {
      console.error("❌ Failed to verify data:", verifyError);
    } else {
      // Verification completed

      // Count by day
      const dailyCounts: { [key: string]: number } = {};
      verifyData?.forEach((visit) => {
        const dateKey = new Date(visit.visited_at).toISOString().split("T")[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      });
    }

    return {
      success: true,
      message:
        "Analytics data has been successfully reset with realistic values",
      totalRecords: realisticData.length,
      dailyCounts: verifyData
        ? Object.fromEntries(
            Object.entries(
              verifyData.reduce((acc: { [key: string]: number }, visit) => {
                const dateKey = new Date(visit.visited_at)
                  .toISOString()
                  .split("T")[0];
                acc[dateKey] = (acc[dateKey] || 0) + 1;
                return acc;
              }, {})
            ).sort(([a], [b]) => a.localeCompare(b))
          )
        : {},
    };
  } catch (error) {
    console.error("❌ Error in simple analytics fix:", error);
    return {
      success: false,
      message: `Failed to fix analytics data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error,
    };
  }
}

// Function to run from browser console or component
export async function runSimpleAnalyticsFix() {
  const result = await simpleAnalyticsFix();
  return result;
}
