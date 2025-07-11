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
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: [
      "recharts",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
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

    // Improve chunk loading reliability
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          web3: {
            test: /[\\/]node_modules[\\/](@rainbow-me|wagmi|viem|@walletconnect)[\\/]/,
            name: "web3",
            chunks: "all",
            priority: 20,
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
