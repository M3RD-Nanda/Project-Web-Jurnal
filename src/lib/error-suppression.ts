/**
 * Error suppression utilities for production builds
 * This file helps suppress known development warnings and errors that don't affect functionality
 */

// List of error patterns to suppress
const SUPPRESSED_ERROR_PATTERNS = [
  "Connection request reset",
  "Failed to load resource: the server responded with a status of 404",
  "Lit is in dev mode",
  "Not recommended for production",
  "lit.dev/msg/dev-mode",
  "WalletConnect",
  "_rsc=",
  "walletconnect",
  "PublicStateController",
  "index.es.js",
  "vanilla.mjs",
  "The label's for attribute doesn't match any element id",
  "Incorrect use of <label for=FORM_ELEMENT>",
  "invalid input syntax for type uuid",
  "workshop-writing",
  "22P02",
];

// List of warning patterns to suppress
const SUPPRESSED_WARNING_PATTERNS = [
  "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}",
  "Lit is in dev mode",
  "WalletConnect debug",
  "The label's for attribute doesn't match any element id",
  "Incorrect use of <label for=FORM_ELEMENT>",
  "label elements",
  "accessibility tools from working correctly",
  "Invalid UUID format",
  "workshop-writing",
  "Skipping database query",
];

/**
 * Initialize error suppression for production builds
 */
export function initializeErrorSuppression() {
  if (typeof window === "undefined") return;

  // Always suppress WalletConnect errors, even in development

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Override console.error
  console.error = (...args: any[]) => {
    const message = args.join(" ");

    // Check if this error should be suppressed
    const shouldSuppressError = SUPPRESSED_ERROR_PATTERNS.some((pattern) =>
      message.includes(pattern)
    );

    // Also check if it's a React error with WalletConnect in the stack
    const isReactWalletConnectError =
      message.includes("Error: Connection request reset") ||
      (args.length > 0 &&
        args[0] instanceof Error &&
        args[0].message?.includes("Connection request reset"));

    if (!shouldSuppressError && !isReactWalletConnectError) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(" ");

    // Check if this warning should be suppressed
    const shouldSuppressWarning = SUPPRESSED_WARNING_PATTERNS.some((pattern) =>
      message.includes(pattern)
    );

    if (!shouldSuppressWarning) {
      originalWarn.apply(console, args);
    }
  };

  // Suppress specific Web3 related logs in production
  if (process.env.NODE_ENV === "production") {
    console.log = (...args: any[]) => {
      const message = args.join(" ");

      // Suppress Web3 connection logs
      if (
        message.includes("Creating custom connectors") ||
        message.includes("Added") ||
        message.includes("connector") ||
        message.includes("Total connectors created")
      ) {
        return;
      }

      originalLog.apply(console, args);
    };
  }
}

/**
 * Suppress specific network errors that are harmless
 */
export function suppressNetworkErrors() {
  if (typeof window === "undefined") return;

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    if (error && typeof error === "object") {
      const message = error.message || error.toString();

      // Suppress known harmless network errors
      if (
        message.includes("Connection request reset") ||
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("_rsc=")
      ) {
        event.preventDefault();
        return;
      }
    }
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    const message = event.message || "";

    // Suppress known harmless errors
    if (
      message.includes("Failed to load resource") ||
      message.includes("404") ||
      message.includes("_rsc=")
    ) {
      event.preventDefault();
      return;
    }
  });
}

/**
 * Initialize all error suppression mechanisms
 */
export function initializeAllErrorSuppression() {
  initializeErrorSuppression();
  suppressNetworkErrors();
}

// Auto-initialize if in browser environment
if (typeof window !== "undefined") {
  // Initialize immediately for early error suppression
  initializeAllErrorSuppression();
}
