import { unstable_cache } from 'next/cache';

// Cache configuration
export const CACHE_TAGS = {
  ARTICLES: 'articles',
  ANNOUNCEMENTS: 'announcements',
  STATISTICS: 'statistics',
  ARCHIVES: 'archives',
} as const;

export const CACHE_DURATIONS = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Generic cache wrapper
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
) {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
      tags: options.tags || [],
    }
  );
}

// Specific cached functions for common operations
export const getCachedArticles = createCachedFunction(
  async () => {
    const { getAllArticles } = await import('@/lib/articles');
    return getAllArticles();
  },
  ['articles', 'all'],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.ARTICLES],
  }
);

export const getCachedAnnouncements = createCachedFunction(
  async () => {
    const { getAllAnnouncements } = await import('@/lib/announcements');
    return getAllAnnouncements();
  },
  ['announcements', 'all'],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.ANNOUNCEMENTS],
  }
);

export const getCachedArticleById = (id: string) =>
  createCachedFunction(
    async (articleId: string) => {
      const { getArticleById } = await import('@/lib/articles');
      return getArticleById(articleId);
    },
    ['article', id],
    {
      revalidate: CACHE_DURATIONS.VERY_LONG,
      tags: [CACHE_TAGS.ARTICLES],
    }
  )(id);

export const getCachedStatistics = createCachedFunction(
  async () => {
    // Import statistics functions dynamically
    const { getVisitorStats } = await import('@/actions/analytics');
    return getVisitorStats();
  },
  ['statistics', 'visitor'],
  {
    revalidate: CACHE_DURATIONS.SHORT,
    tags: [CACHE_TAGS.STATISTICS],
  }
);

// Cache invalidation helpers
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');
  tags.forEach(tag => revalidateTag(tag));
}

export async function revalidateAllArticles() {
  await revalidateCache([CACHE_TAGS.ARTICLES]);
}

export async function revalidateAllAnnouncements() {
  await revalidateCache([CACHE_TAGS.ANNOUNCEMENTS]);
}

export async function revalidateStatistics() {
  await revalidateCache([CACHE_TAGS.STATISTICS]);
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
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}
