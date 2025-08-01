"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface UnifiedWalletButtonWrapperProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function UnifiedWalletButtonWrapper({
  variant = "outline",
  size = "sm",
  className = "",
}: UnifiedWalletButtonWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [UnifiedWalletButton, setUnifiedWalletButton] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Dynamically import the actual component only on client side
    const loadComponent = async () => {
      try {
        // Add a small delay to ensure Web3Provider is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        const walletModule = await import("./UnifiedWalletButton");
        setUnifiedWalletButton(() => walletModule.UnifiedWalletButton);
      } catch (error) {
        console.warn("Failed to load UnifiedWalletButton:", error);
        setLoadError(true);
      }
    };

    if (mounted) {
      loadComponent();
    }
  }, [mounted]);

  // Show loading state during SSR and while component is loading
  if (!mounted || (!UnifiedWalletButton && !loadError)) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-50 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 shadow-sm"
            : "text-muted-foreground border-border bg-background hover:bg-muted"
        } ${className || ""}`}
        disabled
      >
        <div className="relative">
          <Wallet className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        </div>
        <span>Connect Wallet</span>
      </Button>
    );
  }

  // Show error state if component failed to load
  if (loadError || !UnifiedWalletButton) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10 shadow-sm"
            : "text-muted-foreground border-border bg-background hover:bg-muted"
        } ${className || ""}`}
        disabled
      >
        <div className="relative">
          <Wallet className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
        <span>Wallet Unavailable</span>
      </Button>
    );
  }

  // Render the actual component once loaded
  return (
    <UnifiedWalletButton variant={variant} size={size} className={className} />
  );
}
