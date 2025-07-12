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
    // CSS preload warnings - comprehensive patterns
    "was preloaded using link preload but not used within a few seconds",
    "Please make sure it has an appropriate `as` value",
    "preloaded intentionally",
    "_next/static/css/",
    "_next/static/chunks/",
    "web3.css",
    "layout.css",
    "app/layout.css",
    "wallet.css",
    "solana.css",
    "rainbow.css",
    "rainbowkit.css",
    "wagmi.css",
    // RainbowKit specific patterns
    "@rainbow-me/rainbowkit",
    "rainbowkit/styles.css",
    // Resource preload warnings
    "The resource",
    "was preloaded using link preload",
    "but not used within a few seconds",
    "from the window's load event",
    "http://localhost:3000/_next/static/css/",
    "https://localhost:3000/_next/static/css/",
    // Note: Supabase auth warnings removed - these should be fixed at the source
  ];

  // Enhanced suppression function
  const shouldSuppressMessage = (message: string): boolean => {
    // Check for exact patterns
    if (suppressPatterns.some((pattern) => message.includes(pattern))) {
      return true;
    }

    // Check for preload warning pattern specifically
    const preloadPattern =
      /The resource .* was preloaded using link preload but not used within a few seconds/;
    if (preloadPattern.test(message)) {
      return true;
    }

    // Check for CSS file patterns
    const cssPattern = /_next\/static\/css\/.*\.css/;
    if (cssPattern.test(message) && message.includes("preload")) {
      return true;
    }

    // Check for localhost URLs with preload warnings
    const localhostPattern = /http:\/\/localhost:\d+\/_next\/static\/css\//;
    if (localhostPattern.test(message) && message.includes("preload")) {
      return true;
    }

    return false;
  };

  // Override console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(" ");

    if (!shouldSuppressMessage(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Override console.error for specific errors
  console.error = (...args: any[]) => {
    const message = args.join(" ");

    if (!shouldSuppressMessage(message)) {
      originalError.apply(console, args);
    }
  };

  // Set global flags to disable various dev warnings
  (window as any).litDisableBundleWarning = true;
  (window as any).__SUPPRESS_DEV_WARNINGS__ = true;

  // Keep suppression active for longer in development
  // Only restore if explicitly needed for debugging
  if (process.env.RESTORE_CONSOLE_WARNINGS === "true") {
    setTimeout(() => {
      console.warn = originalWarn;
      console.error = originalError;
    }, 10000);
  }
}

// Auto-initialize if in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  suppressDevWarnings();
}
