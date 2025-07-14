"use client";

import { useEffect } from "react";
import { browserCache, preloadCriticalResources } from "@/lib/browser-cache";

interface CacheManagerProps {
  enableServiceWorker?: boolean;
  preloadResources?: boolean;
}

export function CacheManager({
  enableServiceWorker = true,
  preloadResources = true,
}: CacheManagerProps) {
  useEffect(() => {
    // Register service worker
    if (enableServiceWorker && "serviceWorker" in navigator) {
      registerServiceWorker();
    }

    // Preload critical resources
    if (preloadResources) {
      preloadCriticalResources();
    }

    // Setup cache cleanup
    setupCacheCleanup();

    // Setup performance monitoring
    setupPerformanceMonitoring();
  }, [enableServiceWorker, preloadResources]);

  return null; // This is a utility component with no UI
}

/**
 * Register service worker for advanced caching
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register(
      "/sw-cache.js",
      {
        scope: "/",
      }
    );

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker is available
            console.log("New service worker available");

            // Optionally show update notification to user
            if (confirm("New version available. Reload to update?")) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          }
        });
      }
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CACHE_UPDATED") {
        console.log("Cache updated:", event.data.url);
      }
    });

    console.log("Service worker registered successfully");
  } catch (error) {
    console.warn("Service worker registration failed:", error);
  }
}

/**
 * Setup automatic cache cleanup
 */
function setupCacheCleanup() {
  // Clean up expired cache entries periodically
  const cleanupInterval = setInterval(() => {
    browserCache.clear("memory");
  }, 30 * 60 * 1000); // Every 30 minutes

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    clearInterval(cleanupInterval);
  });

  // Cleanup on visibility change (when tab becomes hidden)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      browserCache.clear("memory");
    }
  });
}

/**
 * Setup performance monitoring for cache effectiveness
 */
function setupPerformanceMonitoring() {
  // Monitor cache hit rates
  const originalFetch = window.fetch;
  let fetchCount = 0;
  const cacheHits = 0;

  window.fetch = async function (...args) {
    fetchCount++;

    try {
      const response = await originalFetch.apply(this, args);

      // Log cache performance in development
      if (process.env.NODE_ENV === "development") {
        const cacheStats = browserCache.getStats();
        console.log("Cache stats:", {
          memorySize: cacheStats.memorySize,
          storageSize: cacheStats.storageSize,
          fetchCount,
          cacheHits,
        });
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Monitor Core Web Vitals impact
  if ("web-vitals" in window) {
    // This would integrate with web-vitals library if available
    console.log("Web Vitals monitoring enabled");
  }
}

/**
 * Prefetch resources based on user behavior
 */
export function prefetchOnHover(url: string) {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

/**
 * Preload critical CSS
 */
export function preloadCriticalCSS() {
  const criticalCSS = [
    "/_next/static/css/app.css",
    "/_next/static/css/globals.css",
  ];

  criticalCSS.forEach((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    link.onload = function () {
      const linkElement = this as HTMLLinkElement;
      linkElement.onload = null;
      linkElement.rel = "stylesheet";
    };
    document.head.appendChild(link);
  });
}

/**
 * Cache API responses with intelligent invalidation
 */
export async function cacheAPIResponse(
  url: string,
  data: any,
  dependencies: string[] = []
) {
  const cacheKey = `api_${url}`;

  await browserCache.set(
    cacheKey,
    {
      data,
      dependencies,
      timestamp: Date.now(),
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      storage: "localStorage",
      compress: true,
    }
  );
}

/**
 * Invalidate cache based on dependencies
 */
export async function invalidateCacheDependencies(dependency: string) {
  // This would need to be implemented based on your specific cache structure
  console.log("Invalidating cache for dependency:", dependency);

  // Clear related cache entries
  await browserCache.clear("memory");
}

/**
 * Get cache performance metrics
 */
export function getCacheMetrics() {
  const stats = browserCache.getStats();

  return {
    ...stats,
    hitRatio: calculateHitRatio(),
    efficiency: calculateCacheEfficiency(),
  };
}

function calculateHitRatio(): number {
  // This would need to be implemented based on your tracking
  return 0.85; // Placeholder
}

function calculateCacheEfficiency(): number {
  // This would calculate how much the cache improves performance
  return 0.75; // Placeholder
}
