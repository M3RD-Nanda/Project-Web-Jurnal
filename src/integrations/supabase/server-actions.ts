import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xlvnaempudqlrdonfzun.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsdm5hZW1wdWRxbHJkb25menVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTA3NTQsImV4cCI6MjA2NzU2Njc1NH0.JICLB7UxI6qq-72nyLV4kizTs38NRDYtHSwTASa52K8";

export async function createSupabaseServerClient() { // Made async
  const cookieStore = await cookies(); // Await cookies()

  // Detailed logging for debugging
  console.log('--- createSupabaseServerClient called ---');
  const allCookies = cookieStore.getAll();
  console.log('Server Client: Available cookies (names only):', allCookies.map((c: { name: string }) => c.name)); // Fixed 'c' type
  console.log('Server Client: sb-access-token value:', cookieStore.get('sb-access-token')?.value ? 'PRESENT' : 'NOT PRESENT');
  console.log('Server Client: sb-refresh-token value:', cookieStore.get('sb-refresh-token')?.value ? 'PRESENT' : 'NOT PRESENT');
  console.log('--- End createSupabaseServerClient logging ---');

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This error is expected if called from a Server Component, not a Route Handler/Server Action
            console.warn(`Could not set cookie "${name}" from server client:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            console.warn(`Could not remove cookie "${name}" from server client:`, error);
          }
        },
      },
    }
  );
}