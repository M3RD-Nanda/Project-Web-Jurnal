import { supabase } from "@/integrations/supabase/client";

/**
 * Final script to completely reset analytics data with realistic values
 * This script uses TRUNCATE to completely clear the table
 */

export async function finalAnalyticsFix() {
  try {
    console.log("🔧 Starting final analytics data reset...");

    // Step 1: Use RPC to truncate table (more reliable than DELETE)
    console.log("🗑️ Truncating page_visits table...");
    
    const { error: truncateError } = await supabase.rpc('truncate_page_visits');
    
    if (truncateError) {
      console.log("⚠️ Truncate RPC not available, using DELETE method...");
      
      // Fallback: Delete all records using a condition that matches all
      const { error: deleteError } = await supabase
        .from("page_visits")
        .delete()
        .not("id", "is", null); // This will match all records

      if (deleteError) {
        console.error("❌ Failed to delete data:", deleteError);
        throw new Error(`Failed to delete data: ${deleteError.message}`);
      }
    }

    console.log("✅ All existing data cleared successfully");

    // Step 2: Add realistic data for the past 6 days (not today)
    console.log("📝 Adding realistic visitor data...");
    
    const pages = ["/", "/about", "/current", "/archives"];
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
          visited_at: visitTime.toISOString()
        });
      }
    }

    console.log(`📊 Generated ${realisticData.length} realistic visit records`);

    // Step 3: Insert realistic data in small batches
    if (realisticData.length > 0) {
      const batchSize = 10;
      for (let i = 0; i < realisticData.length; i += batchSize) {
        const batch = realisticData.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from("page_visits")
          .insert(batch);

        if (insertError) {
          console.error(`❌ Failed to insert batch ${Math.floor(i / batchSize) + 1}:`, insertError);
          throw new Error(`Failed to insert batch: ${insertError.message}`);
        }

        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
      }
    }

    // Step 4: Verify the result
    const { data: verifyData, error: verifyError } = await supabase
      .from("page_visits")
      .select("visited_at")
      .order("visited_at", { ascending: false });

    if (verifyError) {
      console.error("❌ Failed to verify data:", verifyError);
    } else {
      console.log(`📈 Verification: Found ${verifyData?.length || 0} total records`);
      
      // Count by day
      const dailyCounts: { [key: string]: number } = {};
      verifyData?.forEach((visit) => {
        const dateKey = new Date(visit.visited_at).toISOString().split('T')[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      });
      
      console.log("📊 Daily visit counts:", dailyCounts);
    }

    return {
      success: true,
      message: "Analytics data has been successfully reset with realistic values",
      totalRecords: realisticData.length,
      actualRecords: verifyData?.length || 0,
      dailyCounts: verifyData ? Object.fromEntries(
        Object.entries(
          verifyData.reduce((acc: { [key: string]: number }, visit) => {
            const dateKey = new Date(visit.visited_at).toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
          }, {})
        ).sort(([a], [b]) => a.localeCompare(b))
      ) : {}
    };

  } catch (error) {
    console.error("❌ Error in final analytics fix:", error);
    return {
      success: false,
      message: `Failed to fix analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  }
}

// Function to run from browser console or component
export async function runFinalAnalyticsFix() {
  console.log("🚀 Running final analytics fix...");
  const result = await finalAnalyticsFix();
  console.log("📋 Fix result:", result);
  return result;
}
