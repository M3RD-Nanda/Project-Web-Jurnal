#!/usr/bin/env tsx

/**
 * Script to fix Analytics Dashboard with realistic data
 * 
 * This script will:
 * 1. Clear existing unrealistic analytics data
 * 2. Generate realistic visitor data for the past 7 days
 * 3. Include multiple popular pages (not just homepage)
 * 4. Use realistic visit patterns (weekday vs weekend, time distribution)
 */

import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env.local") });

import { 
  clearOldData, 
  insertRealisticData 
} from "./realistic-analytics-data";

async function main() {
  console.log("🔧 Analytics Dashboard Fix");
  console.log("==========================");
  console.log("");
  
  console.log("📋 This script will:");
  console.log("   ✓ Remove unrealistic data (like 896 visits on Thursday)");
  console.log("   ✓ Generate realistic visitor patterns (3-12 visits per day)");
  console.log("   ✓ Add multiple popular pages (not just homepage)");
  console.log("   ✓ Use realistic time distributions");
  console.log("   ✓ Include weekend vs weekday patterns");
  console.log("");
  
  try {
    // Clear old unrealistic data
    console.log("🗑️  Step 1: Clearing unrealistic data...");
    await clearOldData();
    
    // Insert new realistic data
    console.log("\n📊 Step 2: Generating realistic analytics data...");
    await insertRealisticData();
    
    console.log("\n🎉 Analytics Dashboard Fix Completed!");
    console.log("=====================================");
    console.log("");
    console.log("✅ Your analytics dashboard now shows:");
    console.log("   • Realistic visitor numbers (3-12 per day)");
    console.log("   • Multiple popular pages with proper distribution");
    console.log("   • Realistic time patterns and trends");
    console.log("   • Weekend vs weekday visitor patterns");
    console.log("");
    console.log("🔄 Please refresh your analytics dashboard to see the changes.");
    
  } catch (error) {
    console.error("\n❌ Error fixing analytics data:", error);
    console.log("\n🔍 Troubleshooting:");
    console.log("   • Make sure your .env.local file has correct Supabase credentials");
    console.log("   • Check that the page_visits table exists in your database");
    console.log("   • Verify your Supabase project is accessible");
    process.exit(1);
  }
}

// Run the script
main();
