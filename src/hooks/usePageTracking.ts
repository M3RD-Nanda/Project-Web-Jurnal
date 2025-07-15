"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function usePageTracking() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");
  const isTracking = useRef<boolean>(false);

  useEffect(() => {
    // Skip if already tracking this path or if it's the same as last tracked
    if (isTracking.current || lastTrackedPath.current === pathname) {
      return;
    }

    const recordVisit = async () => {
      // Prevent duplicate tracking
      if (isTracking.current) return;

      isTracking.current = true;

      try {
        // Record page visit via API route to avoid server-side issues
        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });

        // Update last tracked path on success
        lastTrackedPath.current = pathname;
      } catch (error) {
        console.error("Failed to record page visit:", error);
      } finally {
        isTracking.current = false;
      }
    };

    // Debounce the tracking to prevent rapid fire requests
    const timeoutId = setTimeout(recordVisit, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);
}
