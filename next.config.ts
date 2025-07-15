import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Enable ESLint during builds for better code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript will properly check for type errors during builds
    ignoreBuildErrors: false,
  },
  // Redirects for old announcement URLs
  async redirects() {
    return [
      {
        source: "/announcements/workshop-writing",
        destination: "/announcements/1be1d981-d686-4ba5-880c-9e919bab1728",
        permanent: true,
      },
      {
        source: "/announcements/call-for-papers-vol10-no2",
        destination: "/announcements/2a4e8fac-818d-4bd2-ade8-4ebaadb9f315",
        permanent: true,
      },
    ];
  },
  // Enhanced security headers to replace middleware functionality
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      // Enhanced caching headers for static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      {
        source: "/(.*)\\.(js|css|woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      // Specific CSS MIME type headers to fix MIME type issues
      {
        source: "/(.*)\\.(css)",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Image caching with longer TTL
      {
        source: "/(.*)\\.(png|jpg|jpeg|gif|webp|avif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
          {
            key: "Vary",
            value: "Accept",
          },
        ],
      },
      // API routes caching
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=60",
          },
          {
            key: "Vary",
            value: "Accept, Authorization",
          },
        ],
      },
      // HTML pages caching
      {
        source: "/((?!api).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  // Disable source maps in production to avoid 404 errors
  productionBrowserSourceMaps: false,
  // SWC minification is enabled by default in Next.js 15
  // Enable compression for better performance
  compress: true,
  // Optimize images
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: [
      "recharts",
      "lucide-react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-toast",
      "sonner",
      "@supabase/supabase-js",
      "@tanstack/react-query",
      "date-fns",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
      "viem",
      "wagmi",
      "@rainbow-me/rainbowkit",
      "@solana/wallet-adapter-react",
      "@solana/web3.js",
    ],
    // Enable modern bundling optimizations
    optimizeServerReact: true,
    // Enable partial prerendering for better performance
    ppr: false, // Keep disabled for stability
    // Optimize CSS loading
    optimizeCss: true,
    // Enable more aggressive code splitting (moved to root level)
    // serverComponentsExternalPackages moved to serverExternalPackages
    // Enable concurrent features for better main thread performance
    serverComponentsHmrCache: false, // Disable in production for better performance
    // Enable modern JavaScript features
    esmExternals: true,
  },
  // Move turbo config to turbopack (new stable location)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  env: {
    // Suppress Lit dev mode warnings in all environments
    LIT_DISABLE_DEV_MODE: "true",
    // Additional Lit configuration
    LIT_DISABLE_BUNDLED_WARNINGS: "true",
    // Disable WalletConnect dev warnings
    WALLETCONNECT_DEBUG: "false",
    // Disable CSS preload warnings
    DISABLE_CSS_PRELOAD_WARNINGS: "true",
  },
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }

    // Optimize recharts for better performance
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        path: false,
        assert: false,
        util: false,
        querystring: false,
        "pino-pretty": false,
      };
    } else {
      // Add polyfills for server-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        indexedDB: false,
      };
    }

    // Ignore pino-pretty in client-side bundles (only for client-side)
    if (!isServer) {
      const webpack = require("webpack");

      // Ensure plugins array exists
      if (!config.plugins) {
        config.plugins = [];
      }

      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^pino-pretty$/,
        })
      );
    }

    // Enhanced chunk optimization with CSS handling and tree shaking
    config.optimization = {
      ...config.optimization,
      // Enable tree shaking for better bundle size
      usedExports: true,
      sideEffects: false,
      // Enable module concatenation for smaller bundles
      concatenateModules: true,
      splitChunks: {
        ...config.optimization?.splitChunks,
        // Optimize chunk splitting strategy for better main thread performance
        chunks: "all",
        minSize: 20000,
        maxSize: 200000, // Reduced from 244000 to improve loading
        maxAsyncRequests: 30, // Increase for better code splitting
        maxInitialRequests: 25, // Increase for better initial loading
        cacheGroups: {
          ...config.optimization?.splitChunks?.cacheGroups,
          // CSS styles - optimized to prevent preload warnings
          styles: {
            test: /\.(css|scss|sass)$/,
            name: "styles",
            chunks: "initial", // Changed from "all" to "initial" to prevent unnecessary preloading
            priority: 40,
            enforce: true,
            // Only include CSS that's actually used on initial load
            minChunks: 1,
            // Prevent automatic preloading of CSS chunks
            reuseExistingChunk: true,
          },
          // React and core libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 30,
          },
          // Core UI libraries (only essential ones)
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui\/(react-dialog|react-dropdown-menu|react-navigation-menu|react-toast|react-slot|react-label))[\\/]/,
            name: "ui-core",
            chunks: "all",
            priority: 25,
            maxSize: 150000, // Smaller chunk for core UI
          },
          // Non-essential UI libraries (lazy loaded)
          uiExtended: {
            test: /[\\/]node_modules[\\/](@radix-ui\/(react-accordion|react-alert-dialog|react-aspect-ratio|react-avatar|react-checkbox|react-collapsible|react-context-menu|react-hover-card|react-menubar|react-popover|react-progress|react-radio-group|react-scroll-area|react-select|react-separator|react-slider|react-switch|react-tabs|react-toggle|react-toggle-group|react-tooltip))[\\/]/,
            name: "ui-extended",
            chunks: "async", // Load only when needed
            priority: 20,
            maxSize: 200000,
            minChunks: 1,
          },
          // Web3 libraries - separate chunk to prevent CSS preloading
          web3: {
            test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|@walletconnect|@solana)[\\/]/,
            name: "web3",
            chunks: "async", // Changed to async to prevent preloading
            priority: 20,
            enforce: true,
            maxSize: 200000, // Reduced chunk size to ~200KB for better loading
            minChunks: 1, // Only include if used at least once
          },
          // Supabase and database libraries
          database: {
            test: /[\\/]node_modules[\\/](@supabase|@tanstack)[\\/]/,
            name: "database",
            chunks: "all",
            priority: 18,
            maxSize: 244000,
          },
          // Charts and visualization
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: "charts",
            chunks: "async", // Load charts asynchronously
            priority: 15,
            maxSize: 200000,
            minChunks: 1,
          },
          // Form and validation libraries
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
            name: "forms",
            chunks: "async",
            priority: 12,
            maxSize: 150000, // Smaller chunk for forms
            minChunks: 1,
          },
          // Analytics and monitoring
          analytics: {
            test: /[\\/]node_modules[\\/](@vercel\/analytics|@vercel\/speed-insights)[\\/]/,
            name: "analytics",
            chunks: "async",
            priority: 8,
            maxSize: 100000,
            minChunks: 1,
          },
          // Other vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            minChunks: 2,
            maxSize: 244000,
          },
        },
      },
    };

    // Add plugin to prevent unnecessary CSS preloading
    const webpack = require("webpack");

    // Safely add DefinePlugin
    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.DISABLE_CSS_PRELOAD": JSON.stringify("true"),
      })
    );

    return config;
  },
  // Server external packages removed to avoid conflicts
  // Will be handled by webpack optimization instead
  // Remove standalone output for now to avoid build issues
  // output: "standalone",
};

export default nextConfig;
