import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Menghapus ReadonlyRequestCookies dari impor

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xlvnaempudqlrdonfzun.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsdm5hZW1wdWRxbHJkb25menVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTA3NTQsImV4cCI6MjA2NzU2Njc1NH0.JICLB7UxI6qq-72nyLV4kizTs38NRDYtHSwTASa52K8";

export function createSupabaseServerClient() {
  const cookieStore = cookies(); // Membiarkan TypeScript menginferensi tipe

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
            // The `cookies().set()` method can only be called from a Server Action or Route Handler.
            // This error is safe to ignore if you're only reading cookies.
            console.warn('Could not set cookie from server client:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            console.warn('Could not remove cookie from server client:', error);
          }
          },
      },
    }
  );
}