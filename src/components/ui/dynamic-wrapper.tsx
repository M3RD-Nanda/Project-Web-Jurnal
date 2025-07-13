"use client";

import dynamic from "next/dynamic";
import { ComponentType, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface DynamicWrapperProps {
  children?: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

// Default loading component
const DefaultLoader = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className || ""}`}>
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <span className="ml-2 text-sm text-muted-foreground">Memuat...</span>
  </div>
);

// Higher-order component for dynamic imports with better loading states
export function withDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: () => ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <DefaultLoader />),
    ssr: options?.ssr ?? false,
  });
}

// Specific dynamic imports for common heavy components
export const DynamicChart = withDynamicImport(
  () => import("@/components/charts/ArticlesBarChart"),
  {
    loading: () => (
      <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Memuat grafik...
        </span>
      </div>
    ),
  }
);

export const DynamicWalletComponents = withDynamicImport(
  () => import("@/components/wallet/WalletButton"),
  {
    loading: () => (
      <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
    ),
  }
);

export const DynamicStatistics = withDynamicImport(
  () => import("@/components/StatisticsClientContent"),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    ),
  }
);

// Wrapper component for conditional dynamic loading
export function DynamicWrapper({
  children,
  fallback,
  className,
}: DynamicWrapperProps) {
  return (
    <div className={className}>{children || fallback || <DefaultLoader />}</div>
  );
}
