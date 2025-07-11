"use client";

import { useEffect } from "react";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production and if performance API is available
    if (process.env.NODE_ENV !== "production" || typeof window === "undefined") {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName("first-contentful-paint")[0] as PerformanceEntry;
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Largest Contentful Paint
      if ("PerformanceObserver" in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            if (lastEntry) {
              metrics.lcp = lastEntry.startTime;
            }
          });
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.name === "first-input") {
                metrics.fid = entry.processingStart - entry.startTime;
              }
            });
          });
          fidObserver.observe({ type: "first-input", buffered: true });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            metrics.cls = clsValue;
          });
          clsObserver.observe({ type: "layout-shift", buffered: true });

          // Send metrics after page load
          setTimeout(() => {
            sendMetrics(metrics);
          }, 5000);
        } catch (error) {
          console.warn("Performance monitoring failed:", error);
        }
      }
    };

    // Send metrics to analytics (you can customize this)
    const sendMetrics = (metrics: PerformanceMetrics) => {
      // Only send if we have meaningful data
      if (Object.keys(metrics).length === 0) return;

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("Performance Metrics:", metrics);
      }

      // Send to your analytics service
      // Example: Google Analytics 4
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "web_vitals", {
          custom_map: {
            metric_fcp: "first_contentful_paint",
            metric_lcp: "largest_contentful_paint",
            metric_fid: "first_input_delay",
            metric_cls: "cumulative_layout_shift",
            metric_ttfb: "time_to_first_byte",
          },
          metric_fcp: metrics.fcp,
          metric_lcp: metrics.lcp,
          metric_fid: metrics.fid,
          metric_cls: metrics.cls,
          metric_ttfb: metrics.ttfb,
        });
      }

      // Send to Vercel Analytics (if available)
      if (typeof window !== "undefined" && (window as any).va) {
        (window as any).va("track", "Web Vitals", metrics);
      }
    };

    // Start measuring when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", measureWebVitals);
    } else {
      measureWebVitals();
    }

    // Cleanup
    return () => {
      document.removeEventListener("DOMContentLoaded", measureWebVitals);
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Hook for getting performance metrics in components
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window === "undefined" || !("performance" in window)) {
      return;
    }

    const getMetrics = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        domInteractive: navigation.domInteractive - navigation.navigationStart,
        resourcesLoaded: performance.getEntriesByType("resource").length,
      };
    };

    // Log metrics after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        const metrics = getMetrics();
        console.log("Page Performance:", metrics);
      }, 1000);
    });
  }, []);
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window === "undefined" || !("performance" in window)) {
    return;
  }

  const budgets = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600, // 600ms
  };

  const checkBudget = (metric: keyof typeof budgets, value: number) => {
    const budget = budgets[metric];
    const isWithinBudget = value <= budget;
    
    if (!isWithinBudget) {
      console.warn(`Performance budget exceeded for ${metric}: ${value}ms (budget: ${budget}ms)`);
    }
    
    return isWithinBudget;
  };

  return { checkBudget, budgets };
}
