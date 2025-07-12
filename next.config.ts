import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
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
    // Suppress Lit dev mode warnings in production
    LIT_DISABLE_DEV_MODE:
      process.env.NODE_ENV === "production" ? "true" : "false",
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
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // CSS styles - high priority to prevent preload issues
          styles: {
            test: /\.(css|scss|sass)$/,
            name: "styles",
            chunks: "all",
            priority: 40,
            enforce: true,
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

    return config;
  },
  // Remove standalone output for now to avoid build issues
  // output: "standalone",
};

export default nextConfig;
