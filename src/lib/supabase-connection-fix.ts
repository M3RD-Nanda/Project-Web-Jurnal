// Supabase connection reliability improvements
// This module provides utilities to handle connection issues and improve reliability

import { supabase } from "@/integrations/supabase/client";

// Connection retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  timeout: 15000, // 15 seconds (increased from 10)
};

// Create a promise that rejects after a timeout
function createTimeoutPromise(ms: number) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Connection timeout")), ms);
  });
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  try {
    return (await Promise.race([
      operation(),
      createTimeoutPromise(RETRY_CONFIG.timeout),
    ])) as T;
  } catch (error: any) {
    if (retries > 0 && shouldRetry(error)) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1),
        RETRY_CONFIG.maxDelay
      );

      // Only log retry attempts in development
      if (process.env.NODE_ENV === "development") {
        // Retrying operation with backoff
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1);
    }

    // Handle timeout errors more gracefully
    if (error instanceof Error && error.message.includes("timeout")) {
      throw new Error(
        "Supabase connection timed out. Please check your internet connection."
      );
    }

    throw error;
  }
}

// Determine if an error should trigger a retry
function shouldRetry(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code || "";

  // Retry on network errors, timeouts, and temporary failures
  return (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("fetch") ||
    errorCode === "NETWORK_ERROR" ||
    errorCode === "TIMEOUT" ||
    error.name === "NetworkError" ||
    error.name === "TimeoutError"
  );
}

// Enhanced session getter with retry logic
export async function getSessionWithRetry() {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  });
}

// Enhanced user getter with retry logic
export async function getUserWithRetry() {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  });
}

// Enhanced profile fetcher with retry logic
export async function getProfileWithRetry(userId: string) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data;
  });
}

// Connection health check
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = (await Promise.race([
      supabase.from("profiles").select("id").limit(1),
      createTimeoutPromise(8000), // Increased timeout for health check
    ])) as any;

    return !error;
  } catch (error) {
    // Silently handle timeout errors to prevent console noise
    if (error instanceof Error && error.message.includes("timeout")) {
      return false;
    }
    return false;
  }
}

// Initialize connection with health check
export async function initializeSupabaseConnection() {
  try {
    if (process.env.NODE_ENV === "development") {
    }

    const isHealthy = await checkSupabaseConnection();
    if (!isHealthy) {
      if (process.env.NODE_ENV === "development") {
      }
      return false;
    }

    if (process.env.NODE_ENV === "development") {
    }
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Supabase connection:", error);
    return false;
  }
}

// Preload critical data to warm up the connection
export async function preloadCriticalData() {
  try {
    // Warm up the connection by making a simple query
    await supabase.from("profiles").select("id").limit(1);

    // Check if we have an active session
    const sessionData = await getSessionWithRetry();

    if (sessionData.session) {
      // Preload user data if we have a session
      await getUserWithRetry();
    }

    if (process.env.NODE_ENV === "development") {
    }
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
    }
    return false;
  }
}

// Manual initialization function for better control
export async function initializeSupabaseManually() {
  try {
    const success = await initializeSupabaseConnection();
    if (success) {
      await preloadCriticalData();
    }
    return success;
  } catch (error) {
    console.error("Manual Supabase initialization failed:", error);
    return false;
  }
}

// Auto-initialize on import (only in browser and development)
if (typeof window !== "undefined") {
  // Only auto-initialize in development or when explicitly enabled
  const shouldAutoInit =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SUPABASE_AUTO_INIT === "true";

  if (shouldAutoInit) {
    // Initialize connection after a longer delay to avoid blocking initial render
    setTimeout(async () => {
      try {
        const success = await initializeSupabaseConnection();
        if (success) {
          await preloadCriticalData();
        }
      } catch (error) {
        // Silently handle initialization errors to prevent console noise
        if (process.env.NODE_ENV === "development") {
        }
      }
    }, 1000); // Increased delay from 100ms to 1000ms
  }
}
