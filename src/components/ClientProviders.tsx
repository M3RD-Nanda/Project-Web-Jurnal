"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePageTracking } from "@/hooks/usePageTracking";

// Lazy load heavy components to reduce main thread work
const Web3Provider = dynamic(
  () =>
    import("@/components/Web3Provider").then((mod) => ({
      default: mod.Web3Provider,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

const SolanaProvider = dynamic(
  () =>
    import("@/components/SolanaProvider").then((mod) => ({
      default: mod.SolanaProvider,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Lazy load performance monitor to reduce initial bundle
const PerformanceMonitor = dynamic(
  () =>
    import("@/components/PerformanceMonitor").then((mod) => ({
      default: mod.PerformanceMonitor,
    })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Always provide Web3 providers to prevent hook errors, but optimize for non-wallet pages
function ConditionalWeb3Provider({ children }: { children: React.ReactNode }) {
  const [isWalletPage, setIsWalletPage] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Check if current page needs full Web3 functionality
    const needsFullWeb3 =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/wallet") ||
        window.location.pathname.startsWith("/profile") ||
        window.location.pathname.includes("payment"));
    setIsWalletPage(needsFullWeb3);
  }, []);

  // Always provide Web3Provider to prevent hook errors, but with different configurations
  if (!isMounted) {
    // During SSR/initial mount, provide minimal providers
    return <>{children}</>;
  }

  return (
    <Web3Provider>
      <SolanaProvider>{children}</SolanaProvider>
    </Web3Provider>
  );
}

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  // Initialize client-side page tracking
  usePageTracking();

  return (
    <>
      <ConditionalWeb3Provider>{children}</ConditionalWeb3Provider>
      <PerformanceMonitor />
    </>
  );
}
