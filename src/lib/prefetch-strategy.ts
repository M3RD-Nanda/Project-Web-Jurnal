/**
 * Aggressive Prefetch Strategy for Critical Resources
 * Implements intelligent prefetching for better user experience
 */

import {
  getCachedArticles,
  getCachedAnnouncements,
  getCachedStatistics,
} from "./cache";

interface PrefetchConfig {
  enabled: boolean;
  delay: number;
  priority: "high" | "low";
  condition?: () => boolean;
}

interface PrefetchItem {
  url: string;
  type: "page" | "api" | "resource";
  priority: "high" | "low";
  condition?: () => boolean;
}

// Prefetch configuration
const PREFETCH_CONFIG: Record<string, PrefetchConfig> = {
  // Critical data that should be prefetched immediately
  articles: {
    enabled: true,
    delay: 0,
    priority: "high",
  },
  announcements: {
    enabled: true,
    delay: 100,
    priority: "high",
  },
  statistics: {
    enabled: true,
    delay: 200,
    priority: "low",
  },
  // Navigation prefetching
  navigation: {
    enabled: true,
    delay: 1000,
    priority: "low",
    condition: () =>
      typeof window !== "undefined" &&
      (navigator as any).connection?.effectiveType !== "slow-2g",
  },
};

// Critical pages to prefetch
const CRITICAL_PAGES: PrefetchItem[] = [
  { url: "/articles", type: "page", priority: "high" },
  { url: "/announcements", type: "page", priority: "high" },
  { url: "/about", type: "page", priority: "low" },
  { url: "/author-guidelines", type: "page", priority: "low" },
  { url: "/submission-guidelines", type: "page", priority: "low" },
];

// Critical API endpoints to prefetch
const CRITICAL_APIS: PrefetchItem[] = [
  { url: "/api/articles", type: "api", priority: "high" },
  { url: "/api/announcements", type: "api", priority: "high" },
  { url: "/api/analytics/stats", type: "api", priority: "low" },
];

/**
 * Prefetch critical data on application start
 */
export async function prefetchCriticalData(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Prefetch articles with delay
    if (PREFETCH_CONFIG.articles.enabled) {
      setTimeout(async () => {
        try {
          await getCachedArticles();
          console.log("✅ Articles prefetched successfully");
        } catch (error) {
          console.warn("⚠️ Failed to prefetch articles:", error);
        }
      }, PREFETCH_CONFIG.articles.delay);
    }

    // Prefetch announcements with delay
    if (PREFETCH_CONFIG.announcements.enabled) {
      setTimeout(async () => {
        try {
          await getCachedAnnouncements();
          console.log("✅ Announcements prefetched successfully");
        } catch (error) {
          console.warn("⚠️ Failed to prefetch announcements:", error);
        }
      }, PREFETCH_CONFIG.announcements.delay);
    }

    // Prefetch statistics with delay
    if (PREFETCH_CONFIG.statistics.enabled) {
      setTimeout(async () => {
        try {
          await getCachedStatistics();
          console.log("✅ Statistics prefetched successfully");
        } catch (error) {
          console.warn("⚠️ Failed to prefetch statistics:", error);
        }
      }, PREFETCH_CONFIG.statistics.delay);
    }
  } catch (error) {
    console.warn("⚠️ Error in prefetch critical data:", error);
  }
}

/**
 * Prefetch pages using Next.js router
 */
export function prefetchPages(router: any): void {
  if (typeof window === "undefined" || !router) return;

  // Check network conditions
  const connection = (navigator as any).connection;
  if (
    connection &&
    (connection.effectiveType === "slow-2g" || connection.saveData)
  ) {
    console.log(
      "🚫 Skipping page prefetch due to slow connection or data saver"
    );
    return;
  }

  CRITICAL_PAGES.forEach((page, index) => {
    if (page.condition && !page.condition()) return;

    setTimeout(() => {
      try {
        router.prefetch(page.url);
        console.log(`✅ Page prefetched: ${page.url}`);
      } catch (error) {
        console.warn(`⚠️ Failed to prefetch page ${page.url}:`, error);
      }
    }, index * 200); // Stagger prefetching
  });
}

/**
 * Prefetch API endpoints
 */
export function prefetchAPIs(): void {
  if (typeof window === "undefined") return;

  // Check network conditions
  const connection = (navigator as any).connection;
  if (
    connection &&
    (connection.effectiveType === "slow-2g" || connection.saveData)
  ) {
    console.log(
      "🚫 Skipping API prefetch due to slow connection or data saver"
    );
    return;
  }

  CRITICAL_APIS.forEach((api, index) => {
    if (api.condition && !api.condition()) return;

    setTimeout(() => {
      try {
        // Use fetch with cache to prefetch API responses
        fetch(api.url, {
          method: "GET",
          headers: {
            "Cache-Control": "max-age=300",
          },
        })
          .then(() => {
            console.log(`✅ API prefetched: ${api.url}`);
          })
          .catch((error) => {
            console.warn(`⚠️ Failed to prefetch API ${api.url}:`, error);
          });
      } catch (error) {
        console.warn(`⚠️ Error prefetching API ${api.url}:`, error);
      }
    }, index * 300); // Stagger API prefetching
  });
}

/**
 * Enhanced intelligent prefetching based on user behavior
 * Supports both links and buttons with Next.js routing
 */
export function setupIntelligentPrefetch(): void {
  if (typeof window === "undefined") return;

  let prefetchTimeout: NodeJS.Timeout;
  const prefetchedLinks = new Set<string>();

  // Enhanced hover listener for links and buttons
  document.addEventListener("mouseover", (event) => {
    const target = event.target as HTMLElement;

    // Check for links (a tags)
    const link = target.closest("a[href]") as HTMLAnchorElement;
    // Check for buttons with navigation
    const button = target.closest("button, [role='button']") as HTMLElement;

    let href: string | null = null;

    if (link && link.href) {
      href = link.href;
    } else if (button) {
      // Check for data-href attribute
      const dataHref = button.getAttribute("data-href");
      if (dataHref) {
        href = dataHref.startsWith("/")
          ? window.location.origin + dataHref
          : dataHref;
      }

      // Check for Next.js Link wrapper (button inside Link)
      const parentLink = button.closest("a");
      if (parentLink && parentLink.href) {
        href = parentLink.href;
      }
    }

    if (!href) return;

    // Skip external links and already prefetched links
    if (!href.startsWith(window.location.origin) || prefetchedLinks.has(href))
      return;

    // Clear previous timeout
    if (prefetchTimeout) clearTimeout(prefetchTimeout);

    // Prefetch after hover delay
    prefetchTimeout = setTimeout(() => {
      try {
        const url = new URL(href);

        // Use Next.js router if available
        if ((window as any).__NEXT_ROUTER__) {
          (window as any).__NEXT_ROUTER__.prefetch(url.pathname);
        } else {
          // Fallback to fetch prefetch
          fetch(href, { method: "HEAD" });
        }

        prefetchedLinks.add(href);
        console.log(`✅ Element prefetched on hover: ${url.pathname}`);
      } catch (error) {
        console.warn("⚠️ Failed to prefetch element:", error);
      }
    }, 100); // 100ms hover delay
  });

  // Clear timeout on mouse leave
  document.addEventListener("mouseout", (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a[href]");
    const button = target.closest("button, [role='button']");

    if ((link || button) && prefetchTimeout) {
      clearTimeout(prefetchTimeout);
    }
  });

  // Additional setup for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Find all links and buttons in the newly added content
          const links = element.querySelectorAll("a[href]");
          const buttons = element.querySelectorAll("button, [role='button']");

          // The hover listener will automatically handle these new elements
          // This observer is just for logging and potential future enhancements
          if (links.length > 0 || buttons.length > 0) {
            console.log(
              `🔄 New interactive elements detected: ${links.length} links, ${buttons.length} buttons`
            );
          }
        }
      });
    });
  });

  // Start observing for dynamic content
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/**
 * Prefetch resources based on viewport intersection
 */
export function setupViewportPrefetch(): void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window))
    return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const links = element.querySelectorAll("a[href]");

          links.forEach((link) => {
            const href = (link as HTMLAnchorElement).href;
            if (href && href.startsWith(window.location.origin)) {
              try {
                const url = new URL(href);
                if ((window as any).__NEXT_ROUTER__) {
                  (window as any).__NEXT_ROUTER__.prefetch(url.pathname);
                }
              } catch (error) {
                // Ignore invalid URLs
              }
            }
          });

          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: "100px", // Start prefetching 100px before element enters viewport
      threshold: 0.1,
    }
  );

  // Observe sections that might contain links
  const sections = document.querySelectorAll("section, article, .content");
  sections.forEach((section) => observer.observe(section));
}

/**
 * Initialize all prefetch strategies
 */
export function initializePrefetchStrategy(router?: any): void {
  if (typeof window === "undefined") return;

  console.log("🚀 Initializing aggressive prefetch strategy...");

  // Prefetch critical data immediately
  prefetchCriticalData();

  // Prefetch pages after a short delay
  if (router) {
    setTimeout(() => prefetchPages(router), 1000);
  }

  // Prefetch APIs after a longer delay
  setTimeout(() => prefetchAPIs(), 2000);

  // Setup intelligent prefetching after page load
  if (document.readyState === "complete") {
    setupIntelligentPrefetch();
    setupViewportPrefetch();
  } else {
    window.addEventListener("load", () => {
      setupIntelligentPrefetch();
      setupViewportPrefetch();
    });
  }

  console.log("✅ Prefetch strategy initialized successfully");
}

/**
 * Check if prefetching should be enabled based on network conditions
 */
export function shouldEnablePrefetch(): boolean {
  if (typeof window === "undefined") return false;

  const connection = (navigator as any).connection;

  // Disable on slow connections or data saver mode
  if (connection) {
    if (connection.saveData || connection.effectiveType === "slow-2g") {
      return false;
    }
  }

  // Disable on low memory devices
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 2) {
    return false;
  }

  return true;
}
