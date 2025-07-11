"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    const recordVisit = async () => {
      try {
        // Record page visit via API route to avoid server-side issues
        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (error) {
        console.error("Failed to record page visit:", error);
      }
    };

    recordVisit();
  }, [pathname]);
}
