"use client";

import { useEffect } from "react";
import { initializeAccessibilityFixes, fixThirdPartyComponentAccessibility } from "@/lib/accessibility-fixes";

/**
 * Component that automatically fixes accessibility issues across the application
 * This component should be included in the root layout to ensure all pages benefit from the fixes
 */
export function AccessibilityFixer() {
  useEffect(() => {
    // Initialize global accessibility fixes
    const cleanup = initializeAccessibilityFixes();

    // Fix specific third-party components that are known to have issues
    const fixThirdPartyComponents = () => {
      // Fix Supabase Auth UI
      fixThirdPartyComponentAccessibility('[data-supabase-auth-ui]');
      fixThirdPartyComponentAccessibility('.supabase-auth-ui_ui');
      
      // Fix any other third-party components that might have accessibility issues
      // Add more selectors here as needed
    };

    // Run third-party fixes initially and periodically
    fixThirdPartyComponents();
    const interval = setInterval(fixThirdPartyComponents, 2000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
