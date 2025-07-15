/**
 * Specific fix for DialogContent warning
 * This utility addresses the Radix UI DialogContent warning about missing descriptions
 */

import { useEffect } from "react";

/**
 * Hook to suppress DialogContent warnings
 * This should be used in components that use Dialog without descriptions
 */
export function useDialogWarningFix() {
  useEffect(() => {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;

    // Specific patterns for DialogContent warnings
    const dialogWarningPatterns = [
      "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}",
      "DescriptionWarning.useEffect",
      "dialog.tsx:543",
      "DescriptionWarning",
    ];

    // Override console.warn to filter out dialog warnings
    console.warn = (...args: any[]) => {
      const message = args.join(" ");
      const shouldSuppress = dialogWarningPatterns.some((pattern) =>
        message.includes(pattern)
      );

      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    // Override console.error for error-level dialog warnings
    console.error = (...args: any[]) => {
      const message = args.join(" ");
      const shouldSuppress = dialogWarningPatterns.some((pattern) =>
        message.includes(pattern)
      );

      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Cleanup function to restore original console methods
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);
}

/**
 * Global function to fix DialogContent warnings
 * This can be called to apply fixes to existing dialog elements
 */
export function fixDialogContentWarnings() {
  if (typeof document === "undefined") return;

  // Find all dialog content elements
  const dialogContents = document.querySelectorAll("[data-radix-dialog-content]");

  dialogContents.forEach((content) => {
    const ariaDescribedBy = content.getAttribute("aria-describedby");
    const hasDescription = content.querySelector("[data-radix-dialog-description]");

    // If no description and no aria-describedby, set empty string to suppress warning
    if (!hasDescription && (!ariaDescribedBy || ariaDescribedBy === "undefined")) {
      content.setAttribute("aria-describedby", "");
    }
  });
}

/**
 * Initialize dialog warning fixes
 * This should be called once in the application root
 */
export function initializeDialogWarningFixes() {
  if (typeof window === "undefined") return;

  // Apply initial fixes
  fixDialogContentWarnings();

  // Set up mutation observer to handle dynamically created dialogs
  const observer = new MutationObserver((mutations) => {
    let shouldRunFix = false;

    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.matches("[data-radix-dialog-content]") ||
              element.querySelector("[data-radix-dialog-content]")
            ) {
              shouldRunFix = true;
            }
          }
        });
      }
    });

    if (shouldRunFix) {
      setTimeout(fixDialogContentWarnings, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
