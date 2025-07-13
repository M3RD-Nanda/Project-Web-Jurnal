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
  
  
  try {
    // Clear old unrealistic data
    await clearOldData();
    
    // Insert new realistic data
    await insertRealisticData();
    
    
  } catch (error) {
    console.error("\n❌ Error fixing analytics data:", error);
    process.exit(1);
  }
}

// Run the script
main();
