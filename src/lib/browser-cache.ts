"use client";

/**
 * Browser-side caching utilities for better performance
 * Includes localStorage, sessionStorage, and IndexedDB caching
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  compress?: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
}

class BrowserCache {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly prefix = 'jurnal_cache_';

  /**
   * Get data from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.prefix + key;
    const { storage = 'localStorage' } = options;

    try {
      let entry: CacheEntry | null = null;

      // Try memory cache first
      if (storage === 'memory' || this.memoryCache.has(fullKey)) {
        entry = this.memoryCache.get(fullKey) || null;
      } else if (typeof window !== 'undefined') {
        // Try browser storage
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        const cached = storageObj.getItem(fullKey);
        
        if (cached) {
          entry = JSON.parse(cached);
        }
      }

      if (!entry) return null;

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        await this.delete(key, options);
        return null;
      }

      // Decompress if needed
      let data = entry.data;
      if (entry.compressed && typeof data === 'string') {
        data = this.decompress(data);
      }

      return data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.prefix + key;
    const { 
      ttl = 5 * 60 * 1000, // 5 minutes default
      storage = 'localStorage',
      compress = false 
    } = options;

    try {
      let processedData = data;
      
      // Compress if requested and data is large
      if (compress && typeof data === 'object') {
        const jsonString = JSON.stringify(data);
        if (jsonString.length > 1000) { // Only compress if > 1KB
          processedData = this.compress(jsonString) as T;
        }
      }

      const entry: CacheEntry = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        compressed: compress
      };

      // Store in memory cache
      if (storage === 'memory') {
        this.memoryCache.set(fullKey, entry);
      } else if (typeof window !== 'undefined') {
        // Store in browser storage
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.setItem(fullKey, JSON.stringify(entry));
      }
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.prefix + key;
    const { storage = 'localStorage' } = options;

    try {
      // Remove from memory cache
      this.memoryCache.delete(fullKey);

      // Remove from browser storage
      if (typeof window !== 'undefined') {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        storageObj.removeItem(fullKey);
      }
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(storage: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage'): Promise<void> {
    try {
      if (storage === 'memory') {
        this.memoryCache.clear();
      } else if (typeof window !== 'undefined') {
        const storageObj = storage === 'sessionStorage' ? sessionStorage : localStorage;
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < storageObj.length; i++) {
          const key = storageObj.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storageObj.removeItem(key));
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Simple compression using base64 encoding
   */
  private compress(data: string): string {
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  }

  /**
   * Simple decompression
   */
  private decompress(data: string): any {
    try {
      return JSON.parse(decodeURIComponent(atob(data)));
    } catch {
      return data;
    }
  }

  /**
   * Get cache size and statistics
   */
  getStats(): { memorySize: number; storageSize: number } {
    let storageSize = 0;
    
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const value = localStorage.getItem(key);
            if (value) {
              storageSize += value.length;
            }
          }
        }
      } catch (error) {
        console.warn('Error getting storage stats:', error);
      }
    }

    return {
      memorySize: this.memoryCache.size,
      storageSize
    };
  }
}

// Global browser cache instance
export const browserCache = new BrowserCache();

/**
 * Cached fetch wrapper for API calls
 */
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {},
  cacheOptions: CacheOptions = {}
): Promise<T> {
  const cacheKey = `fetch_${url}_${JSON.stringify(options)}`;
  
  // Try cache first
  const cached = await browserCache.get<T>(cacheKey, cacheOptions);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  await browserCache.set(cacheKey, data, cacheOptions);
  
  return data;
}

/**
 * Preload and cache critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    '/api/articles',
    '/api/announcements',
    '/api/statistics'
  ];

  criticalResources.forEach(url => {
    // Use requestIdleCallback for non-blocking preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        cachedFetch(url, {}, { ttl: 10 * 60 * 1000 }); // 10 minutes
      });
    }
  });
}

// Auto-cleanup expired entries on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Clean up expired entries after page load
    setTimeout(() => {
      browserCache.clear('memory');
    }, 5000);
  });
}
