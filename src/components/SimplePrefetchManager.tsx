"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Simple PrefetchManager Component
 * Manages basic prefetching and service worker registration without server imports
 */
export function SimplePrefetchManager() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    let mounted = true;

    const initializeOptimizations = async () => {
      try {
        // Check network conditions
        const connection = (navigator as any).connection;
        if (connection && (connection.effectiveType === 'slow-2g' || connection.saveData)) {
          console.log("🚫 Prefetch disabled due to network conditions");
          return;
        }

        // Register service worker for offline caching
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
              scope: "/",
            });

            if (registration.installing) {
              console.log("🔧 Service worker installing...");
            } else if (registration.waiting) {
              console.log("⏳ Service worker waiting...");
            } else if (registration.active) {
              console.log("✅ Service worker active");
            }

            // Schedule periodic cache cleanup
            setInterval(() => {
              if (registration.active) {
                registration.active.postMessage({ type: "CACHE_CLEANUP" });
              }
            }, 24 * 60 * 60 * 1000); // Daily cleanup

          } catch (error) {
            console.warn("⚠️ Service worker registration failed:", error);
          }
        }

        // Simple prefetch for critical pages
        if (mounted && router) {
          const criticalPages = ['/articles', '/announcements', '/about'];
          criticalPages.forEach((page, index) => {
            setTimeout(() => {
              try {
                router.prefetch(page);
                console.log(`✅ Page prefetched: ${page}`);
              } catch (error) {
                console.warn(`⚠️ Failed to prefetch page ${page}:`, error);
              }
            }, index * 200);
          });
        }

        // Preload critical fonts
        const fonts = ['/fonts/geist-sans.woff2', '/fonts/geist-mono.woff2'];
        fonts.forEach((font) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          link.href = font;
          document.head.appendChild(link);
        });

        // DNS prefetch for external domains
        const domains = [
          'https://xlvnaempudqlrdonfzun.supabase.co',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
        ];

        domains.forEach((domain) => {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        });

        // Preconnect for critical domains
        const criticalDomains = ['https://xlvnaempudqlrdonfzun.supabase.co'];
        criticalDomains.forEach((domain) => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });

        console.log("✅ Simple prefetch optimizations initialized");

      } catch (error) {
        console.warn("⚠️ Error initializing optimizations:", error);
      }
    };

    // Initialize after a short delay to not block initial render
    const timeoutId = setTimeout(initializeOptimizations, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
