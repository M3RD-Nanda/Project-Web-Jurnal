"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side Prefetch Manager
 * Initializes all prefetch optimizations on the client side only
 */
export function ClientPrefetchManager() {
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    let mounted = true;

    const initializeOptimizations = async () => {
      try {
        // Check network conditions
        const connection = (navigator as any).connection;
        if (
          connection &&
          (connection.effectiveType === "slow-2g" || connection.saveData)
        ) {
          console.log("🚫 Prefetch disabled due to network conditions");
          return;
        }

        // Initialize hover prefetch strategy
        if (mounted && router) {
          console.log("🚀 Initializing hover prefetch strategy...");
          setupHoverPrefetch(router);
        }

        // Register service worker for offline caching
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register(
              "/sw.js",
              {
                scope: "/",
              }
            );

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

        // Preload critical fonts
        const fonts = ["/fonts/geist-sans.woff2", "/fonts/geist-mono.woff2"];
        fonts.forEach((font) => {
          const link = document.createElement("link");
          link.rel = "preload";
          link.as = "font";
          link.type = "font/woff2";
          link.crossOrigin = "anonymous";
          link.href = font;
          document.head.appendChild(link);
        });

        // DNS prefetch for external domains
        const domains = [
          "https://xlvnaempudqlrdonfzun.supabase.co",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ];

        domains.forEach((domain) => {
          const link = document.createElement("link");
          link.rel = "dns-prefetch";
          link.href = domain;
          document.head.appendChild(link);
        });

        // Preconnect for critical domains
        const criticalDomains = ["https://xlvnaempudqlrdonfzun.supabase.co"];
        criticalDomains.forEach((domain) => {
          const link = document.createElement("link");
          link.rel = "preconnect";
          link.href = domain;
          link.crossOrigin = "anonymous";
          document.head.appendChild(link);
        });

        // Enhanced navigation elements
        enhanceNavigationElements();

        console.log("✅ Enhanced prefetch optimizations initialized");
      } catch (error) {
        console.warn("⚠️ Error initializing optimizations:", error);
      }
    };

    // Setup hover prefetch function
    const setupHoverPrefetch = (router: any) => {
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
        if (
          !href.startsWith(window.location.origin) ||
          prefetchedLinks.has(href)
        )
          return;

        // Clear previous timeout
        if (prefetchTimeout) clearTimeout(prefetchTimeout);

        // Prefetch after hover delay
        prefetchTimeout = setTimeout(() => {
          try {
            const url = new URL(href);
            router.prefetch(url.pathname);
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
    };

    // Enhanced navigation elements function
    const enhanceNavigationElements = () => {
      // Find all buttons that are wrapped in Next.js Link components
      const linkWrappedButtons = document.querySelectorAll(
        "a button, a [role='button']"
      );

      linkWrappedButtons.forEach((button) => {
        const parentLink = button.closest("a");
        if (
          parentLink &&
          parentLink.href &&
          !button.getAttribute("data-href")
        ) {
          button.setAttribute("data-href", parentLink.href);
          console.log(`✅ Enhanced button with data-href: ${parentLink.href}`);
        }
      });

      // Find buttons with specific navigation patterns
      const navigationButtons = document.querySelectorAll(
        "button, [role='button']"
      );

      navigationButtons.forEach((button) => {
        const buttonElement = button as HTMLElement;

        // Skip if already has data-href
        if (buttonElement.getAttribute("data-href")) return;

        // Check for common navigation patterns in text content
        const buttonText = buttonElement.textContent?.toLowerCase() || "";
        const navigationKeywords = [
          "home",
          "about",
          "search",
          "current",
          "archives",
          "announcements",
          "faq",
          "login",
          "register",
          "dashboard",
          "profile",
          "settings",
          "articles",
          "contact",
        ];

        const hasNavigationKeyword = navigationKeywords.some((keyword) =>
          buttonText.includes(keyword)
        );

        if (hasNavigationKeyword) {
          // Try to infer the route from the button text
          let inferredRoute = "";

          if (buttonText.includes("home")) inferredRoute = "/";
          else if (buttonText.includes("about")) inferredRoute = "/about";
          else if (buttonText.includes("search")) inferredRoute = "/search";
          else if (buttonText.includes("current")) inferredRoute = "/current";
          else if (buttonText.includes("archives")) inferredRoute = "/archives";
          else if (buttonText.includes("announcements"))
            inferredRoute = "/announcements";
          else if (buttonText.includes("faq")) inferredRoute = "/faq";
          else if (buttonText.includes("login")) inferredRoute = "/login";
          else if (buttonText.includes("register")) inferredRoute = "/register";
          else if (buttonText.includes("dashboard"))
            inferredRoute = "/dashboard";
          else if (buttonText.includes("profile")) inferredRoute = "/profile";
          else if (buttonText.includes("settings")) inferredRoute = "/settings";
          else if (buttonText.includes("articles")) inferredRoute = "/articles";
          else if (buttonText.includes("contact")) inferredRoute = "/contact";

          if (inferredRoute) {
            buttonElement.setAttribute("data-href", inferredRoute);
            console.log(
              `✅ Enhanced navigation button with inferred route: ${inferredRoute}`
            );
          }
        }
      });

      // Re-enhance when new content is added
      const observer = new MutationObserver((mutations) => {
        let shouldReEnhance = false;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const hasButtons =
                element.querySelectorAll("button, [role='button']").length > 0;
              const hasLinks = element.querySelectorAll("a").length > 0;

              if (hasButtons || hasLinks) {
                shouldReEnhance = true;
              }
            }
          });
        });

        if (shouldReEnhance) {
          // Debounce re-enhancement to avoid excessive calls
          setTimeout(enhanceNavigationElements, 100);
        }
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
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
