"use client";

import { useEffect } from "react";

/**
 * Global error suppression component that intercepts and suppresses
 * specific error patterns before they reach the console
 */
export function GlobalErrorSuppression() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Patterns to suppress
    const suppressedPatterns = [
      "Connection request reset",
      "WalletConnect",
      "walletconnect",
      "PublicStateController",
      "index.es.js",
      "vanilla.mjs",
      "_rsc=",
    ];

    // Override console.error with more aggressive filtering
    console.error = (...args: any[]) => {
      const message = args.join(" ");
      
      // Check if any suppressed pattern is found
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      // Also check for Error objects
      if (args[0] instanceof Error) {
        const errorMessage = args[0].message || "";
        const shouldSuppressError = suppressedPatterns.some(pattern =>
          errorMessage.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (shouldSuppressError) {
          return; // Suppress the error
        }
      }

      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      const message = args.join(" ");
      
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message || "";
      const shouldSuppress = suppressedPatterns.some(pattern =>
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (shouldSuppress) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error && typeof error === "object") {
        const message = error.message || error.toString();
        const shouldSuppress = suppressedPatterns.some(pattern =>
          message.toLowerCase().includes(pattern.toLowerCase())
        );

        if (shouldSuppress) {
          event.preventDefault();
          return;
        }
      }
    };

    // Add event listeners
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
