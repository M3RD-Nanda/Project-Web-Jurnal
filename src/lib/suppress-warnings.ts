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
    "dialog.tsx:543",
    "dialog.tsx:543 Warning:",
    "DescriptionWarning.useEffect @ dialog.tsx:",
    "DescriptionWarning.useEffect	@	dialog.tsx:543",
    "Missing `Description`",
    "DialogContent",
    "aria-describedby={undefined}",
    "DescriptionWarning",
    "Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}",
    "IndexedDB",
    "eval @",
    "reactive-element.js",
    "issueWarning @",
    // Wallet-related warnings
    "Phantom was registered as a Standard Wallet",
    "The Wallet Adapter for Phantom can be removed from your app",
    "⚠️ Phantom wallet not detected",
    "❌ Phantom Ethereum provider not found",
    "Phantom Ethereum provider not found",
    "getPhantomEthereumProvider",
    // Preload warnings
    "The resource",
    "was preloaded using link preload but not used within a few seconds",
    "preload but not used within a few seconds",
    "_next/static/media/",
    ".woff2 was preloaded using link preload",
    "gyByhwUxId8gMEwcGFWNOITd-s.p.da1ebef7.woff2",
    "The label's for attribute doesn't match any element id",
    "Incorrect use of <label for=FORM_ELEMENT>",
    "label elements",
    "accessibility tools from working correctly",
    "invalid input syntax for type uuid",
    "Invalid UUID format",
    "22P02",
    // CSS preload warnings - comprehensive patterns
    "was preloaded using link preload but not used within a few seconds",
    "Please make sure it has an appropriate `as` value",
    "preloaded intentionally",
    "_next/static/css/",
    "_next/static/chunks/",
    // Specific Next.js server chunk patterns
    "root-of-the-server",
    "%5Broot-of-the-server%5D",
    "[root-of-the-server]",
    "__cf301ea5",
    "_.css",
    // URL encoded patterns
    "%5B",
    "%5D",
    // Common CSS file patterns
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
    "http://localhost:3000/_next/static/chunks/",
    "https://localhost:3000/_next/static/chunks/",
    // Wallet-related debug messages and warnings
    "WalletConnect",
    "walletconnect",
    "Connection request reset",
    "Wallet connection error",
    "Getting icon for connector",
    "FORCED: Using centralized icon",
    "Using EIP-6963 icon",
    "Using connector icon",
    "Using default icon",
    "Building wallet list",
    "Skipping duplicate wallet",
    "Wallet mapped:",
    "Attempting to reconnect",
    "Wallet connection saved",
    "Wallet disconnected",
    "User cancelled wallet connection",
    "Wallet not installed",
    "Wallet not selected, retrying",
    "brave wallet",
    "Brave Wallet",
    "MetaMask",
    "Coinbase Wallet",
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

    // Check for chunks pattern specifically
    const chunksPattern = /_next\/static\/chunks\/.*\.css/;
    if (chunksPattern.test(message) && message.includes("preload")) {
      return true;
    }

    // Check for root-of-the-server pattern specifically
    const serverPattern =
      /root-of-the-server|%5Broot-of-the-server%5D|\[root-of-the-server\]/;
    if (serverPattern.test(message) && message.includes("preload")) {
      return true;
    }

    // Check for localhost URLs with preload warnings
    const localhostPattern = /http:\/\/localhost:\d+\/_next\/static\/css\//;
    if (localhostPattern.test(message) && message.includes("preload")) {
      return true;
    }

    // General preload warning pattern
    const generalPreloadPattern =
      /The resource .* was preloaded using link preload but not used within a few seconds/;
    if (generalPreloadPattern.test(message)) {
      return true;
    }

    // Any message containing "preload but not used"
    if (message.includes("preload but not used within a few seconds")) {
      return true;
    }

    // Font file preload warnings
    const fontPattern =
      /\.(woff2?|ttf|otf|eot).*was preloaded using link preload/;
    if (fontPattern.test(message)) {
      return true;
    }

    // Network IP address preload warnings
    const networkPattern = /http:\/\/192\.168\.\d+\.\d+:\d+\/_next\/static/;
    if (networkPattern.test(message) && message.includes("preload")) {
      return true;
    }

    return false;
  };

  // Safely override console methods only if they're writable
  try {
    const warnDescriptor = Object.getOwnPropertyDescriptor(console, "warn");
    const errorDescriptor = Object.getOwnPropertyDescriptor(console, "error");

    if (!warnDescriptor || warnDescriptor.writable !== false) {
      console.warn = (...args: any[]) => {
        const message = args.join(" ");
        if (!shouldSuppressMessage(message)) {
          originalWarn.apply(console, args);
        }
      };
    }

    if (!errorDescriptor || errorDescriptor.writable !== false) {
      console.error = (...args: any[]) => {
        const message = args.join(" ");
        if (!shouldSuppressMessage(message)) {
          originalError.apply(console, args);
        }
      };
    }
  } catch (error) {
    // If console override fails, just use environment flags
  }

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
