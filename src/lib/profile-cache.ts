/**
 * Profile Cache Management
 * Handles caching of user profile data for faster subsequent loads
 */

export interface CachedUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface CachedProfile {
  profile: CachedUserProfile;
  timestamp: number;
  sessionId: string;
}

// Cache configuration
const CACHE_CONFIG = {
  // Cache duration in milliseconds (30 minutes)
  CACHE_DURATION: 30 * 60 * 1000,
  // Storage keys
  PROFILE_CACHE_KEY: "jebaka_profile_cache",
  SESSION_CACHE_KEY: "jebaka_session_cache",
  // Maximum cache entries to prevent storage bloat
  MAX_CACHE_ENTRIES: 5,
};

/**
 * Get cached profile data
 */
export function getCachedProfile(sessionId: string): CachedUserProfile | null {
  try {
    if (typeof window === "undefined") return null;

    const cached = localStorage.getItem(CACHE_CONFIG.PROFILE_CACHE_KEY);
    if (!cached) return null;

    const cachedData: CachedProfile = JSON.parse(cached);

    // Check if cache is still valid
    const now = Date.now();
    const isExpired = now - cachedData.timestamp > CACHE_CONFIG.CACHE_DURATION;

    // Check if session matches
    const isSessionMatch = cachedData.sessionId === sessionId;

    if (isExpired || !isSessionMatch) {
      // Clear expired or mismatched cache
      clearProfileCache();
      return null;
    }

    console.log("✅ Profile loaded from cache");
    return cachedData.profile;
  } catch (error) {
    console.warn("⚠️ Error reading profile cache:", error);
    clearProfileCache();
    return null;
  }
}

/**
 * Cache profile data
 */
export function setCachedProfile(
  profile: CachedUserProfile,
  sessionId: string
): void {
  try {
    if (typeof window === "undefined") return;

    const cachedData: CachedProfile = {
      profile,
      timestamp: Date.now(),
      sessionId,
    };

    localStorage.setItem(
      CACHE_CONFIG.PROFILE_CACHE_KEY,
      JSON.stringify(cachedData)
    );
    console.log("✅ Profile cached successfully");
  } catch (error) {
    console.warn("⚠️ Error caching profile:", error);
    // If storage is full, try to clear old cache and retry
    try {
      clearProfileCache();
      const cachedData: CachedProfile = {
        profile,
        timestamp: Date.now(),
        sessionId,
      };
      localStorage.setItem(
        CACHE_CONFIG.PROFILE_CACHE_KEY,
        JSON.stringify(cachedData)
      );
    } catch (retryError) {
      console.warn("⚠️ Failed to cache profile after cleanup:", retryError);
    }
  }
}

/**
 * Clear profile cache
 */
export function clearProfileCache(): void {
  try {
    if (typeof window === "undefined") return;

    localStorage.removeItem(CACHE_CONFIG.PROFILE_CACHE_KEY);
    console.log("🗑️ Profile cache cleared");
  } catch (error) {
    console.warn("⚠️ Error clearing profile cache:", error);
  }
}

/**
 * Cache session data for quick access
 */
export function setCachedSession(sessionData: any): void {
  try {
    if (typeof window === "undefined") return;

    const cacheData = {
      session: sessionData,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(
      CACHE_CONFIG.SESSION_CACHE_KEY,
      JSON.stringify(cacheData)
    );
    console.log("✅ Session cached successfully");
  } catch (error) {
    console.warn("⚠️ Error caching session:", error);
  }
}

/**
 * Get cached session data
 */
export function getCachedSession(): any | null {
  try {
    if (typeof window === "undefined") return null;

    const cached = sessionStorage.getItem(CACHE_CONFIG.SESSION_CACHE_KEY);
    if (!cached) return null;

    const cachedData = JSON.parse(cached);

    // Check if cache is still valid (shorter duration for session)
    const now = Date.now();
    const isExpired = now - cachedData.timestamp > 10 * 60 * 1000; // 10 minutes

    if (isExpired) {
      clearSessionCache();
      return null;
    }

    console.log("✅ Session loaded from cache");
    return cachedData.session;
  } catch (error) {
    console.warn("⚠️ Error reading session cache:", error);
    clearSessionCache();
    return null;
  }
}

/**
 * Clear session cache
 */
export function clearSessionCache(): void {
  try {
    if (typeof window === "undefined") return;

    sessionStorage.removeItem(CACHE_CONFIG.SESSION_CACHE_KEY);
    console.log("🗑️ Session cache cleared");
  } catch (error) {
    console.warn("⚠️ Error clearing session cache:", error);
  }
}

/**
 * Clear all caches (useful for logout)
 */
export function clearAllCaches(): void {
  clearProfileCache();
  clearSessionCache();
  console.log("🗑️ All caches cleared");
}

/**
 * Check if profile cache is valid
 */
export function isProfileCacheValid(sessionId: string): boolean {
  try {
    if (typeof window === "undefined") return false;

    const cached = localStorage.getItem(CACHE_CONFIG.PROFILE_CACHE_KEY);
    if (!cached) return false;

    const cachedData: CachedProfile = JSON.parse(cached);

    const now = Date.now();
    const isExpired = now - cachedData.timestamp > CACHE_CONFIG.CACHE_DURATION;
    const isSessionMatch = cachedData.sessionId === sessionId;

    return !isExpired && isSessionMatch;
  } catch (error) {
    return false;
  }
}

/**
 * Preload profile data in background
 */
export function preloadProfileData(
  sessionId: string,
  fetchFunction: () => Promise<CachedUserProfile | null>
): void {
  // Only preload if cache is invalid
  if (!isProfileCacheValid(sessionId)) {
    setTimeout(async () => {
      try {
        const profile = await fetchFunction();
        if (profile) {
          setCachedProfile(profile, sessionId);
        }
      } catch (error) {
        console.warn("⚠️ Background profile preload failed:", error);
      }
    }, 100); // Small delay to not block initial render
  }
}
