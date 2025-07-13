/**
 * Aggressive Memory Cache Layer for Database Queries
 * Provides in-memory caching with automatic cleanup and intelligent invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, maxSize: 1000 };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize = 1000, cleanupIntervalMs = 300000) {
    // 5 minutes cleanup
    this.stats.maxSize = maxSize;
    this.startCleanup(cleanupIntervalMs);
  }

  /**
   * Get cached data with automatic TTL checking
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.size--;
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(key: string, data: T, ttlMs = 300000): void {
    // Default 5 minutes
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.stats.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
      accessCount: 1,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit ratio
   */
  getHitRatio(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, intervalMs);
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
    this.stats.size = this.cache.size;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Memory cache cleanup: removed ${keysToDelete.length} expired entries`
      );
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global cache instance
const globalCache = new MemoryCache(1000, 300000); // 1000 entries, 5 min cleanup

// Cache duration constants
export const MEMORY_CACHE_DURATIONS = {
  VERY_SHORT: 30000, // 30 seconds
  SHORT: 60000, // 1 minute
  MEDIUM: 300000, // 5 minutes
  LONG: 900000, // 15 minutes
  VERY_LONG: 3600000, // 1 hour
} as const;

/**
 * Cached function wrapper with memory cache
 */
export function withMemoryCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = MEMORY_CACHE_DURATIONS.MEDIUM
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);

    // Try to get from cache first
    const cached = globalCache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    try {
      const result = await fn(...args);
      globalCache.set(key, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string): number {
  let deletedCount = 0;
  const keysToDelete: string[] = [];

  for (const key of globalCache["cache"].keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => {
    if (globalCache.delete(key)) {
      deletedCount++;
    }
  });

  return deletedCount;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return globalCache.getStats();
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  globalCache.clear();
}

// Export the cache instance for direct access if needed
export { globalCache };

// Cleanup on process exit
if (typeof process !== "undefined") {
  process.on("exit", () => {
    globalCache.destroy();
  });

  process.on("SIGINT", () => {
    globalCache.destroy();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    globalCache.destroy();
    process.exit(0);
  });
}
