import { createClient } from "@supabase/supabase-js";
import { format, subDays } from "date-fns";
import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

// Use service role key for admin operations, fallback to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseKey) {
  throw new Error(
    "Missing Supabase keys. Please check your .env.local file for SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

console.log(
  `🔑 Using ${
    supabaseServiceKey ? "service role" : "anonymous"
  } key for database operations`
);

const supabase = createClient(supabaseUrl, supabaseKey);

interface VisitRecord {
  path: string;
  visited_at: string;
}

// Realistic page paths with more balanced weights for better distribution
const pageData = [
  { path: "/", weight: 25, name: "Beranda" },
  { path: "/current", weight: 20, name: "Edisi Terkini" },
  { path: "/about", weight: 15, name: "Tentang" },
  { path: "/archives", weight: 12, name: "Arsip" },
  { path: "/search", weight: 10, name: "Pencarian" },
  { path: "/announcements", weight: 8, name: "Pengumuman" },
  { path: "/statistics", weight: 5, name: "Statistik" },
  { path: "/guidelines", weight: 3, name: "Panduan" },
  { path: "/publication-fee", weight: 1.5, name: "Biaya Publikasi" },
  { path: "/contact", weight: 0.5, name: "Kontak" },
];

// Generate weighted random page selection
function getRandomPage(): string {
  const totalWeight = pageData.reduce((sum, page) => sum + page.weight, 0);
  let random = Math.random() * totalWeight;

  for (const page of pageData) {
    random -= page.weight;
    if (random <= 0) {
      return page.path;
    }
  }

  return pageData[0].path; // fallback
}

// Generate realistic visitor data for the past 7 days
function generateRealisticVisitorData(): VisitRecord[] {
  const visits: VisitRecord[] = [];

  // Generate data for past 7 days (including today)
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const date = subDays(new Date(), dayOffset);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isToday = dayOffset === 0;

    // Realistic visit patterns
    let dailyVisits: number;
    if (isToday) {
      // Today: fewer visits since day isn't complete
      dailyVisits = Math.floor(Math.random() * 8) + 2; // 2-9 visits
    } else if (isWeekend) {
      // Weekend: lower activity
      dailyVisits = Math.floor(Math.random() * 6) + 3; // 3-8 visits
    } else {
      // Weekday: normal activity
      dailyVisits = Math.floor(Math.random() * 8) + 5; // 5-12 visits
    }

    for (let i = 0; i < dailyVisits; i++) {
      // Realistic time distribution (more visits during work hours)
      let hour: number;
      if (isWeekend) {
        // Weekend: more spread out
        hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
      } else {
        // Weekday: peak during work hours
        const timeSlot = Math.random();
        if (timeSlot < 0.6) {
          // 60% during work hours (9 AM - 5 PM)
          hour = Math.floor(Math.random() * 8) + 9;
        } else {
          // 40% during other hours
          hour = Math.floor(Math.random() * 14) + 8;
        }
      }

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const visitTime = new Date(date);
      visitTime.setHours(hour, minute, second);

      visits.push({
        path: getRandomPage(),
        visited_at: visitTime.toISOString(),
      });
    }
  }

  return visits;
}

async function clearOldData() {
  console.log("🗑️  Clearing old analytics data...");

  try {
    // Get count of existing records
    const { count: totalRecords, error: countError } = await supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error counting existing data:", countError);
      throw countError;
    }

    if (!totalRecords || totalRecords === 0) {
      console.log("ℹ️  No existing data to clear");
      return;
    }

    console.log(`📊 Found ${totalRecords} existing records, clearing all...`);

    // Strategy 1: Try to delete all records in batches
    console.log("🔄 Attempting batch deletion...");

    let deletedCount = 0;
    let attempts = 0;
    const maxAttempts = 5;

    while (deletedCount < totalRecords && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Deletion attempt ${attempts}/${maxAttempts}...`);

      // Get a batch of records to delete
      const { data: batchData, error: batchError } = await supabase
        .from("page_visits")
        .select("id")
        .limit(1000); // Delete in batches of 1000

      if (batchError) {
        console.error(`❌ Error fetching batch ${attempts}:`, batchError);
        break;
      }

      if (!batchData || batchData.length === 0) {
        console.log("✅ No more records to delete");
        break;
      }

      // Delete this batch
      const { error: deleteError } = await supabase
        .from("page_visits")
        .delete()
        .in(
          "id",
          batchData.map((record) => record.id)
        );

      if (deleteError) {
        console.error(`❌ Error deleting batch ${attempts}:`, deleteError);

        // Try alternative deletion method
        console.log("🔄 Trying alternative deletion method...");
        const { error: altDeleteError } = await supabase
          .from("page_visits")
          .delete()
          .gte("id", 0)
          .limit(1000);

        if (altDeleteError) {
          console.error("❌ Alternative deletion also failed:", altDeleteError);
          break;
        }
      }

      deletedCount += batchData.length;
      console.log(
        `✅ Deleted batch ${attempts}: ${batchData.length} records (total: ${deletedCount})`
      );

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Final verification
    const { count: remainingCount, error: verifyError } = await supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true });

    if (verifyError) {
      console.error("❌ Error verifying deletion:", verifyError);
    } else {
      console.log(
        `📊 Deletion complete. Remaining records: ${remainingCount || 0}`
      );
      if (remainingCount && remainingCount > 0) {
        console.log(
          "⚠️  Some data may still remain, but continuing with new data insertion..."
        );
      } else {
        console.log("✅ All data cleared successfully");
      }
    }
  } catch (error) {
    console.error("❌ Error in clearOldData:", error);
    throw error;
  }
}

async function insertRealisticData() {
  console.log("📊 Generating realistic analytics data...");

  const visits = generateRealisticVisitorData();

  console.log(`📈 Generated ${visits.length} realistic visit records`);
  console.log("📋 Page distribution:");

  // Show distribution
  const pathCounts: { [key: string]: number } = {};
  visits.forEach((visit) => {
    pathCounts[visit.path] = (pathCounts[visit.path] || 0) + 1;
  });

  Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([path, count]) => {
      const pageName = pageData.find((p) => p.path === path)?.name || path;
      console.log(`   ${pageName} (${path}): ${count} visits`);
    });

  console.log("\n💾 Inserting data into database...");

  // Insert in batches to avoid timeout
  const batchSize = 50;
  for (let i = 0; i < visits.length; i += batchSize) {
    const batch = visits.slice(i, i + batchSize);

    const { error } = await supabase.from("page_visits").insert(batch);

    if (error) {
      console.error(
        `❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
        error
      );
      throw error;
    }

    console.log(
      `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        visits.length / batchSize
      )}`
    );
  }

  console.log("🎉 All realistic data inserted successfully!");
}

async function main() {
  try {
    console.log("🚀 Starting realistic analytics data generation...");

    await clearOldData();
    await insertRealisticData();

    console.log("\n✨ Analytics data generation completed!");
    console.log(
      "🔄 Refresh your analytics dashboard to see the new realistic data."
    );
  } catch (error) {
    console.error("💥 Error:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateRealisticVisitorData, clearOldData, insertRealisticData };
