"use server";

import { supabaseAdmin } from "@/integrations/supabase/server";
import { headers } from "next/headers";

export async function recordPageVisit(path: string) {
  try {
    // Optional: Get user ID if logged in (for more detailed analytics)
    // const { data: { user } } = await supabaseAdmin.auth.getUser();
    // const userId = user?.id || null;

    const { error } = await supabaseAdmin
      .from('page_visits')
      .insert({ path: path }); // user_id: userId if you add it to the table

    if (error) {
      console.error("Error recording page visit:", error.message);
      // Do not throw error to avoid breaking page load, just log
    }
  } catch (e) {
    console.error("Unexpected error in recordPageVisit:", e);
  }
}