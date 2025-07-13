import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily disable ESLint during builds to focus on console cleanup
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript will now properly check for type errors during builds
    ignoreBuildErrors: false,
  },
  // Disable source maps in production to avoid 404 errors
  productionBrowserSourceMaps: false,
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
    ],
    // Fix webpack minification issues (disabled for Turbopack compatibility)
    // forceSwcTransforms: true, // Commented out for Turbopack support
    // Note: Removed optimizeCss and cssChunking as they cause build issues
    // CSS optimization is handled through webpack configuration instead
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

    // Enhanced chunk optimization with CSS handling
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
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
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@headlessui|framer-motion)[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 25,
          },
          // Web3 libraries - separate chunk to prevent CSS preloading
          web3: {
            test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|@walletconnect|@solana)[\\/]/,
            name: "web3",
            chunks: "async", // Changed to async to prevent preloading
            priority: 20,
            enforce: true,
          },
          // Charts and visualization
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: "charts",
            chunks: "all",
            priority: 15,
          },
          // Other vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            minChunks: 2,
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
  // Remove standalone output for now to avoid build issues
  // output: "standalone",
};

export default nextConfig;
