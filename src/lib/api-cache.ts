/**
 * API Response Caching Utilities
 * Provides aggressive caching for API responses with intelligent invalidation
 */

import { NextRequest, NextResponse } from "next/server";
import { withMemoryCache, MEMORY_CACHE_DURATIONS } from "./memory-cache";

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  revalidate?: number;
  staleWhileRevalidate?: number;
  vary?: string[];
}

interface CachedResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}

// Default cache configurations for different API types
export const API_CACHE_CONFIGS = {
  // Static content - long cache
  static: {
    ttl: MEMORY_CACHE_DURATIONS.VERY_LONG,
    revalidate: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
  },

  // Dynamic content - medium cache
  dynamic: {
    ttl: MEMORY_CACHE_DURATIONS.MEDIUM,
    revalidate: 300, // 5 minutes
    staleWhileRevalidate: 1800, // 30 minutes
  },

  // Real-time data - short cache
  realtime: {
    ttl: MEMORY_CACHE_DURATIONS.SHORT,
    revalidate: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },

  // User-specific data - very short cache
  user: {
    ttl: MEMORY_CACHE_DURATIONS.VERY_SHORT,
    revalidate: 30, // 30 seconds
    staleWhileRevalidate: 120, // 2 minutes
  },
} as const;

/**
 * Create cache headers for API responses
 */
export function createCacheHeaders(
  options: CacheOptions
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (options.revalidate && options.staleWhileRevalidate) {
    headers[
      "Cache-Control"
    ] = `public, max-age=${options.revalidate}, stale-while-revalidate=${options.staleWhileRevalidate}`;
  } else if (options.revalidate) {
    headers["Cache-Control"] = `public, max-age=${options.revalidate}`;
  } else {
    headers["Cache-Control"] = "public, max-age=300"; // Default 5 minutes
  }

  if (options.vary && options.vary.length > 0) {
    headers["Vary"] = options.vary.join(", ");
  }

  // Add ETag for better caching
  headers["ETag"] = `"${Date.now()}"`;

  return headers;
}

/**
 * Wrapper for API route handlers with aggressive caching
 */
export function withAPICache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  options: CacheOptions = {}
) {
  const ttl = options.ttl || MEMORY_CACHE_DURATIONS.MEDIUM;
  const cachedHandler = withMemoryCache(
    async (request: NextRequest) => {
      const response = await handler(request);
      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: Date.now(),
      } as CachedResponse;
    },
    (request: NextRequest) => {
      const url = new URL(request.url);
      const searchParams = url.searchParams.toString();
      const authHeader = request.headers.get("authorization") || "";
      return `api:${url.pathname}:${searchParams}:${authHeader}`;
    },
    ttl
  );

  return async (request: NextRequest): Promise<NextResponse<T>> => {
    try {
      // Check if request should be cached
      if (request.method !== "GET") {
        return handler(request);
      }

      // Get cached response
      const cachedResponse = await cachedHandler(request);

      // Create response with cache headers
      const cacheHeaders = createCacheHeaders(options);
      const response = NextResponse.json(cachedResponse.data, {
        status: cachedResponse.status,
        headers: {
          ...cacheHeaders,
          ...cachedResponse.headers,
        },
      });

      return response;
    } catch (error) {
      console.warn("API cache error:", error);
      return handler(request);
    }
  };
}

/**
 * Cache wrapper for static API endpoints (articles, announcements, etc.)
 */
export function withStaticAPICache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return withAPICache(handler, {
    ...API_CACHE_CONFIGS.static,
    vary: ["Accept-Encoding"],
  });
}

/**
 * Cache wrapper for dynamic API endpoints (search, filters, etc.)
 */
export function withDynamicAPICache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return withAPICache(handler, {
    ...API_CACHE_CONFIGS.dynamic,
    vary: ["Accept-Encoding", "Accept-Language"],
  });
}

/**
 * Cache wrapper for real-time API endpoints (analytics, stats, etc.)
 */
export function withRealtimeAPICache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return withAPICache(handler, {
    ...API_CACHE_CONFIGS.realtime,
    vary: ["Accept-Encoding"],
  });
}

/**
 * Cache wrapper for user-specific API endpoints
 */
export function withUserAPICache<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return withAPICache(handler, {
    ...API_CACHE_CONFIGS.user,
    vary: ["Accept-Encoding", "Authorization", "Cookie"],
  });
}

/**
 * Conditional GET support for better caching
 */
export function handleConditionalGet(
  request: NextRequest,
  lastModified: Date,
  etag?: string
): NextResponse | null {
  const ifModifiedSince = request.headers.get("if-modified-since");
  const ifNoneMatch = request.headers.get("if-none-match");

  // Check If-Modified-Since
  if (ifModifiedSince) {
    const modifiedSince = new Date(ifModifiedSince);
    if (lastModified <= modifiedSince) {
      return new NextResponse(null, { status: 304 });
    }
  }

  // Check If-None-Match (ETag)
  if (ifNoneMatch && etag) {
    if (ifNoneMatch === etag || ifNoneMatch === "*") {
      return new NextResponse(null, { status: 304 });
    }
  }

  return null;
}

/**
 * Create optimized JSON response with caching headers
 */
export function createCachedJSONResponse<T>(
  data: T,
  options: CacheOptions & {
    status?: number;
    lastModified?: Date;
    etag?: string;
  } = {}
): NextResponse<T> {
  const headers = createCacheHeaders(options);

  if (options.lastModified) {
    headers["Last-Modified"] = options.lastModified.toUTCString();
  }

  if (options.etag) {
    headers["ETag"] = options.etag;
  }

  return NextResponse.json(data, {
    status: options.status || 200,
    headers,
  });
}

/**
 * Invalidate API cache by pattern
 */
export function invalidateAPICache(pattern: string): void {
  const { invalidateCache } = require("./memory-cache");
  invalidateCache(`api:${pattern}`);
}

/**
 * Preload API endpoints for better performance
 */
export async function preloadAPIEndpoints(endpoints: string[]): Promise<void> {
  if (typeof window === "undefined") return;

  const promises = endpoints.map(async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
        method: "HEAD",
        headers: {
          "Cache-Control": "max-age=300",
        },
      });

      if (response.ok) {
        console.log(`✅ API endpoint preloaded: ${endpoint}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to preload API endpoint ${endpoint}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Smart cache warming for critical API endpoints
 */
export async function warmAPICache(): Promise<void> {
  const criticalEndpoints = [
    "/api/articles",
    "/api/announcements",
    "/api/analytics/stats",
  ];

  await preloadAPIEndpoints(criticalEndpoints);
}

/**
 * Response compression helper
 */
export function shouldCompress(request: NextRequest): boolean {
  const acceptEncoding = request.headers.get("accept-encoding") || "";
  return acceptEncoding.includes("gzip") || acceptEncoding.includes("br");
}

/**
 * Create compressed response if supported
 */
export function createCompressedResponse<T>(
  data: T,
  request: NextRequest,
  options: CacheOptions = {}
): NextResponse<T> {
  const headers = createCacheHeaders(options);

  if (shouldCompress(request)) {
    headers["Content-Encoding"] = "gzip";
    headers["Vary"] = "Accept-Encoding";
  }

  return NextResponse.json(data, { headers });
}
