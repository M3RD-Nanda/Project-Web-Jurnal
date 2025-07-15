"use client";

import { useEffect, useCallback } from "react";

interface ResourcePreloaderProps {
  criticalResources?: string[];
  prefetchResources?: string[];
  preloadImages?: string[];
  enableIntelligentPrefetch?: boolean;
}

/**
 * Resource preloader component for optimizing loading performance
 */
export function ResourcePreloader({
  criticalResources = [],
  prefetchResources = [],
  preloadImages = [],
  enableIntelligentPrefetch = true,
}: ResourcePreloaderProps) {
  // Preload critical resources immediately
  const preloadCriticalResources = useCallback(() => {
    criticalResources.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";

      // Determine resource type
      if (url.endsWith(".css")) {
        link.as = "style";
      } else if (url.endsWith(".js")) {
        link.as = "script";
      } else if (url.match(/\.(jpg|jpeg|png|webp|avif|svg)$/)) {
        link.as = "image";
      } else if (url.endsWith(".woff2") || url.endsWith(".woff")) {
        link.as = "font";
        link.crossOrigin = "anonymous";
      } else {
        link.as = "fetch";
        link.crossOrigin = "anonymous";
      }

      link.href = url;
      document.head.appendChild(link);
    });
  }, [criticalResources]);

  // Prefetch resources during idle time
  const prefetchResourcesOnIdle = useCallback(() => {
    const prefetchResource = (url: string) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        prefetchResources.forEach(prefetchResource);
      });
    } else {
      setTimeout(() => {
        prefetchResources.forEach(prefetchResource);
      }, 2000);
    }
  }, [prefetchResources]);

  // Preload images with intersection observer
  const preloadImagesOnDemand = useCallback(() => {
    preloadImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [preloadImages]);

  // Intelligent prefetching based on user behavior
  const setupIntelligentPrefetch = useCallback(() => {
    if (!enableIntelligentPrefetch) return;

    // Track mouse movements to predict next page
    let mouseMovements: Array<{ x: number; y: number; timestamp: number }> = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent movements
      mouseMovements = mouseMovements.filter(
        (movement) => Date.now() - movement.timestamp < 1000
      );
    };

    // Prefetch on hover with delay
    const handleLinkHover = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.href) {
        setTimeout(() => {
          // Check if still hovering
          if (target.matches(":hover")) {
            const link = document.createElement("link");
            link.rel = "prefetch";
            link.href = target.href;
            document.head.appendChild(link);
          }
        }, 100);
      }
    };

    // Setup event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleLinkHover, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleLinkHover);
    };
  }, [enableIntelligentPrefetch]);

  // Preload critical CSS inline
  const preloadCriticalCSS = useCallback(() => {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      
      .transition-opacity {
        transition-property: opacity;
        transition-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
        transition-duration: 300ms;
      }
    `;

    const style = document.createElement("style");
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }, []);

  // Setup resource hints
  const setupResourceHints = useCallback(() => {
    // DNS prefetch for external domains
    const externalDomains = [
      "fonts.googleapis.com",
      "fonts.gstatic.com",
      "vercel.live",
      "vitals.vercel-insights.com",
    ];

    externalDomains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical third-party origins
    const preconnectDomains = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];

    preconnectDomains.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });
  }, []);

  // Optimize font loading
  const optimizeFontLoading = useCallback(() => {
    // Preload critical fonts
    const criticalFonts = [
      "/fonts/geist-sans.woff2",
      "/fonts/geist-mono.woff2",
    ];

    criticalFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.href = font;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Add font-display: swap to existing fonts
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'Geist';
        font-display: swap;
      }
      @font-face {
        font-family: 'Geist Mono';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Setup performance monitoring
  const setupPerformanceMonitoring = useCallback(() => {
    // Monitor resource loading performance
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === "resource") {
            const resourceEntry = entry as PerformanceResourceTiming;

            // Log slow resources in development
            if (
              process.env.NODE_ENV === "development" &&
              resourceEntry.duration > 1000
            ) {
              console.warn("Slow resource detected:", {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ["resource"] });

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Execute critical preloading immediately
    preloadCriticalResources();
    preloadCriticalCSS();
    setupResourceHints();
    optimizeFontLoading();

    // Use requestIdleCallback for non-critical operations to reduce main thread work
    const scheduleNonCritical = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(
          () => {
            prefetchResourcesOnIdle();
            preloadImagesOnDemand();
            setupPerformanceMonitoring();
          },
          { timeout: 5000 }
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          prefetchResourcesOnIdle();
          preloadImagesOnDemand();
          setupPerformanceMonitoring();
        }, 1000);
      }
    };

    // Defer non-critical operations even more to reduce initial main thread work
    const timeoutId = setTimeout(scheduleNonCritical, 200);

    // Setup intelligent prefetching with lower priority
    let cleanupIntelligentPrefetch: (() => void) | undefined;
    const setupPrefetchLater = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(
          () => {
            cleanupIntelligentPrefetch = setupIntelligentPrefetch();
          },
          { timeout: 10000 }
        );
      } else {
        setTimeout(() => {
          cleanupIntelligentPrefetch = setupIntelligentPrefetch();
        }, 2000);
      }
    };

    const prefetchTimeoutId = setTimeout(setupPrefetchLater, 500);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(prefetchTimeoutId);
      cleanupIntelligentPrefetch?.();
    };
  }, [
    preloadCriticalResources,
    preloadCriticalCSS,
    setupResourceHints,
    optimizeFontLoading,
    prefetchResourcesOnIdle,
    preloadImagesOnDemand,
    setupPerformanceMonitoring,
    setupIntelligentPrefetch,
  ]);

  return null; // This component has no visual output
}

// Default configuration for the journal website
export const JournalResourcePreloader = () => (
  <ResourcePreloader
    criticalResources={[
      // CSS is automatically handled by Next.js - no manual preload needed
      "/favicon.ico",
      "/jimeka-logo.webp",
    ]}
    prefetchResources={[
      "/api/articles",
      "/api/announcements",
      "/api/statistics",
    ]}
    preloadImages={["/jimeka-logo.webp", "/images/hero-bg.jpg"]}
    enableIntelligentPrefetch={true}
  />
);
