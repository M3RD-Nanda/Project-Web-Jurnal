"use server";

import { supabaseAdmin } from "@/integrations/supabase/server";

export async function recordPageVisit(path: string) {
  try {
    // Rate limiting: Only record one visit per path per minute per session
    // This helps prevent excessive recording from rapid page refreshes
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Check if there's already a recent visit for this path
    const { data: recentVisits, error: checkError } = await supabaseAdmin
      .from("page_visits")
      .select("id")
      .eq("path", path)
      .gte("visited_at", oneMinuteAgo.toISOString())
      .limit(1);

    if (checkError) {
      console.error("Error checking recent visits:", checkError.message);
      // Continue with recording if check fails
    } else if (recentVisits && recentVisits.length > 0) {
      // Skip recording if there's a recent visit for this path
      console.log(
        `[Analytics] Skipping duplicate visit for ${path} within 1 minute`
      );
      return;
    }

    // Record the visit
    const { error } = await supabaseAdmin
      .from("page_visits")
      .insert({ path: path });

    if (error) {
      console.error("Error recording page visit:", error.message);
      // Do not throw error to avoid breaking page load, just log
    } else {
      console.log(`[Analytics] Recorded visit for ${path}`);
    }
  } catch (e) {
    console.error("Unexpected error in recordPageVisit:", e);
  }
}
