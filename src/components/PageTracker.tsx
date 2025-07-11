"use client";

import { usePageTracking } from "@/hooks/usePageTracking";

export function PageTracker() {
  usePageTracking();
  return null; // This component doesn't render anything
}
