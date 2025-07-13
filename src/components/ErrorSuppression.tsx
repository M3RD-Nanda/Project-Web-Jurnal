"use client";

import { useEffect } from "react";
import { initializeAllErrorSuppression } from "@/lib/error-suppression";

/**
 * Client-side component to initialize error suppression
 */
export function ErrorSuppression() {
  useEffect(() => {
    // Initialize error suppression on client-side
    initializeAllErrorSuppression();
  }, []);

  // This component doesn't render anything
  return null;
}
