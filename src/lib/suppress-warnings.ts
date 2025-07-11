// Suppress development warnings for better development experience
// This file helps suppress known warnings that don't affect functionality

export function suppressDevWarnings() {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return;
  }

  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;

  // List of warning patterns to suppress
  const suppressPatterns = [
    "Lit is in dev mode",
    "lit.dev/msg/dev-mode",
    "Not recommended for production",
    "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}",
    "Warning: Missing `Description`",
    "DescriptionWarning.useEffect",
    "dialog.tsx:38 Warning: Missing",
    "IndexedDB",
    "eval @",
    "reactive-element.js",
    "issueWarning @",
    // CSS preload warnings - these are performance optimizations by Next.js
    "was preloaded using link preload but not used within a few seconds",
    "Please make sure it has an appropriate `as` value",
    "_next/static/css/web3.css",
    "_next/static/css/app/layout.css",
    // Removed Supabase auth warnings since we fixed the actual security issue
    // "Using the user object as returned from supabase.auth.getSession()",
    // "could be insecure! This value comes directly from the storage medium",
    // "Use supabase.auth.getUser() instead which authenticates the data",
  ];

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(" ");

    // Check if this warning should be suppressed
    const shouldSuppress = suppressPatterns.some((pattern) =>
      message.includes(pattern)
    );

    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Override console.error for specific errors
  console.error = (...args: any[]) => {
    const message = args.join(" ");

    // Only suppress specific non-critical errors
    const shouldSuppress = suppressPatterns.some((pattern) =>
      message.includes(pattern)
    );

    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  // Set global flags to disable various dev warnings
  (window as any).litDisableBundleWarning = true;
  (window as any).__SUPPRESS_DEV_WARNINGS__ = true;

  // Restore original methods after a delay to allow initialization
  setTimeout(() => {
    console.warn = originalWarn;
    console.error = originalError;
  }, 5000);
}

// Auto-initialize if in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  suppressDevWarnings();
}
