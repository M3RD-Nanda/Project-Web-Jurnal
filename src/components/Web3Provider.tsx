"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { getWagmiConfig } from "@/lib/web3-config";

// Import RainbowKit styles - handled properly to prevent preload warnings
import "@rainbow-me/rainbowkit/styles.css";

interface Web3ProviderProps {
  children: React.ReactNode;
}

// Create a context to track Web3 provider availability
const Web3Context = createContext<{
  isWeb3Available: boolean;
  isLoading: boolean;
}>({
  isWeb3Available: false,
  isLoading: true,
});

export const useWeb3Context = () => useContext(Web3Context);

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function RainbowKitThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // Custom theme configuration for better contrast
  const customLightTheme = lightTheme({
    accentColor: "hsl(220.9, 39.3%, 39.3%)", // Primary color from CSS variables
    accentColorForeground: "hsl(210, 40%, 98%)",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  const customDarkTheme = darkTheme({
    accentColor: "hsl(217.2, 65%, 45%)", // Updated to match new softer primary color for dark mode
    accentColorForeground: "hsl(0, 0%, 98%)",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  return (
    <RainbowKitProvider
      theme={theme === "dark" ? customDarkTheme : customLightTheme}
      appInfo={{
        appName: "Jurnal Website",
        learnMoreUrl: "https://rainbowkit.com",
      }}
      modalSize="compact"
      showRecentTransactions={false}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWeb3Available, setIsWeb3Available] = useState(false);

  useEffect(() => {
    // Only mount on client side
    if (typeof window !== "undefined") {
      const initializeWeb3 = async () => {
        try {
          // Add delay to ensure all client-side APIs are available
          await new Promise((resolve) => setTimeout(resolve, 100));

          const wagmiConfig = getWagmiConfig();
          if (wagmiConfig) {
            setConfig(wagmiConfig);
            setIsWeb3Available(true);
          }
        } catch (error) {
          console.error("Error initializing Web3 config:", error);
          setIsWeb3Available(false);
        } finally {
          setMounted(true);
          setIsLoading(false);
        }
      };

      initializeWeb3();
    } else {
      // Server-side: mark as not loading but not available
      setIsLoading(false);
      setIsWeb3Available(false);
    }
  }, []);

  // Always provide the context, regardless of Web3 availability
  const contextValue = {
    isWeb3Available,
    isLoading,
  };

  // Server-side rendering: provide context with minimal WagmiProvider
  if (typeof window === "undefined") {
    // Create a minimal server-side config
    let serverConfig;
    try {
      serverConfig = createConfig({
        chains: [mainnet],
        transports: {
          [mainnet.id]: http(),
        },
        ssr: true,
      });
    } catch (error) {
      console.error("Failed to create server config:", error);
      // Return without WagmiProvider if config creation fails
      return (
        <Web3Context.Provider value={contextValue}>
          {children}
        </Web3Context.Provider>
      );
    }

    return (
      <Web3Context.Provider value={contextValue}>
        <WagmiProvider config={serverConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </Web3Context.Provider>
    );
  }

  // Always provide WagmiProvider to prevent hook errors
  let finalConfig = config || getWagmiConfig();

  // If config is still null, create a minimal fallback config
  if (!finalConfig) {
    try {
      finalConfig = createConfig({
        chains: [mainnet],
        transports: {
          [mainnet.id]: http(),
        },
        ssr: true,
      });
    } catch (error) {
      console.error("Failed to create fallback config:", error);
      // Return minimal provider without Wagmi if all else fails
      return (
        <Web3Context.Provider value={contextValue}>
          {children}
        </Web3Context.Provider>
      );
    }
  }

  // Client-side but not yet mounted: provide context with loading state but still include WagmiProvider
  if (!mounted || isLoading) {
    return (
      <Web3Context.Provider value={contextValue}>
        <WagmiProvider config={finalConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </Web3Context.Provider>
    );
  }

  // At this point we should always have a valid config
  if (isWeb3Available) {
    // Full Web3 setup with RainbowKit
    return (
      <Web3Context.Provider value={contextValue}>
        <WagmiProvider config={finalConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitThemeProvider>{children}</RainbowKitThemeProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </Web3Context.Provider>
    );
  } else {
    // Minimal setup without RainbowKit
    return (
      <Web3Context.Provider value={contextValue}>
        <WagmiProvider config={finalConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </Web3Context.Provider>
    );
  }
}

// Hook to check if Web3 is available
export function useWeb3Available() {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
}
