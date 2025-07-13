import { unstable_cache } from "next/cache";
import {
  withMemoryCache,
  MEMORY_CACHE_DURATIONS,
  invalidateCache as invalidateMemoryCache,
} from "./memory-cache";

// Cache configuration
export const CACHE_TAGS = {
  ARTICLES: "articles",
  ANNOUNCEMENTS: "announcements",
  STATISTICS: "statistics",
  ARCHIVES: "archives",
  USERS: "users",
  ANALYTICS: "analytics",
  RATINGS: "ratings",
} as const;

export const CACHE_DURATIONS = {
  VERY_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  ULTRA_LONG: 604800, // 1 week
} as const;

// Enhanced cache wrapper with dual-layer caching (memory + Next.js)
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
    memoryCache?: boolean;
    memoryCacheTtl?: number;
  } = {}
) {
  const nextjsCache = unstable_cache(fn, keyParts, {
    revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
    tags: options.tags || [],
  });

  // If memory cache is disabled, return only Next.js cache
  if (options.memoryCache === false) {
    return nextjsCache;
  }

  // Create dual-layer cache with memory cache as first layer
  const memoryTtl = options.memoryCacheTtl || MEMORY_CACHE_DURATIONS.MEDIUM;

  return withMemoryCache(
    nextjsCache,
    (...args: T) => `${keyParts.join(":")}-${JSON.stringify(args)}`,
    memoryTtl
  );
}

// Aggressive cache wrapper for frequently accessed data
export function createAggressiveCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
) {
  return createCachedFunction(fn, keyParts, {
    ...options,
    memoryCache: true,
    memoryCacheTtl: MEMORY_CACHE_DURATIONS.LONG,
  });
}

// Specific cached functions for common operations with aggressive caching
export const getCachedArticles = createAggressiveCachedFunction(
  async () => {
    const { getAllArticles } = await import("@/lib/articles");
    return getAllArticles();
  },
  ["articles", "all"],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.ARTICLES],
  }
);

export const getCachedAnnouncements = createAggressiveCachedFunction(
  async () => {
    const { getAllAnnouncements } = await import("@/lib/announcements");
    return getAllAnnouncements();
  },
  ["announcements", "all"],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.ANNOUNCEMENTS],
  }
);

export const getCachedArticleById = (id: string) =>
  createAggressiveCachedFunction(
    async (articleId: string) => {
      const { getArticleById } = await import("@/lib/articles");
      return getArticleById(articleId);
    },
    ["article", id],
    {
      revalidate: CACHE_DURATIONS.VERY_LONG,
      tags: [CACHE_TAGS.ARTICLES],
    }
  )(id);

export const getCachedStatistics = createCachedFunction(
  async () => {
    // Import statistics functions dynamically
    const { getVisitorStats } = await import("@/lib/analytics");
    return getVisitorStats();
  },
  ["statistics", "visitor"],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.STATISTICS],
    memoryCache: true,
    memoryCacheTtl: MEMORY_CACHE_DURATIONS.SHORT, // Shorter memory cache for analytics
  }
);

// New aggressive cached functions for better performance
export const getCachedUsers = createAggressiveCachedFunction(
  async () => {
    const { getAllUsersWithProfiles } = await import("@/lib/users");
    return getAllUsersWithProfiles();
  },
  ["users", "all"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.USERS],
  }
);

export const getCachedRatings = createAggressiveCachedFunction(
  async () => {
    const { getAllRatings } = await import("@/lib/ratings");
    return getAllRatings();
  },
  ["ratings", "all"],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.RATINGS],
  }
);

export const getCachedArchives = createAggressiveCachedFunction(
  async () => {
    const { getAllIssues } = await import("@/lib/issues");
    return getAllIssues();
  },
  ["archives", "all"],
  {
    revalidate: CACHE_DURATIONS.VERY_LONG,
    tags: [CACHE_TAGS.ARCHIVES],
  }
);

// Enhanced cache invalidation helpers with memory cache support
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import("next/cache");

  // Invalidate Next.js cache
  tags.forEach((tag) => revalidateTag(tag));

  // Invalidate memory cache for related patterns
  tags.forEach((tag) => {
    invalidateMemoryCache(tag);
  });
}

export async function revalidateAllArticles() {
  await revalidateCache([CACHE_TAGS.ARTICLES]);
  invalidateMemoryCache("articles");
}

export async function revalidateAllAnnouncements() {
  await revalidateCache([CACHE_TAGS.ANNOUNCEMENTS]);
  invalidateMemoryCache("announcements");
}

export async function revalidateStatistics() {
  await revalidateCache([CACHE_TAGS.STATISTICS]);
  invalidateMemoryCache("statistics");
}

export async function revalidateAllUsers() {
  await revalidateCache([CACHE_TAGS.USERS]);
  invalidateMemoryCache("user");
}

export async function revalidateAllRatings() {
  await revalidateCache([CACHE_TAGS.RATINGS]);
  invalidateMemoryCache("ratings");
}

export async function revalidateAllArchives() {
  await revalidateCache([CACHE_TAGS.ARCHIVES]);
  invalidateMemoryCache("archives");
}

// Bulk invalidation for performance
export async function revalidateAll() {
  const allTags = Object.values(CACHE_TAGS);
  await revalidateCache(allTags);

  // Clear all memory cache
  const { clearAllCache } = await import("./memory-cache");
  clearAllCache();
}

// Memory cache for client-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expiry: number }>();

  set(key: string, data: any, ttl: number = CACHE_DURATIONS.MEDIUM * 1000) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}
