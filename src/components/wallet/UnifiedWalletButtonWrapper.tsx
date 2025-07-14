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

  useEffect(() => {
    setMounted(true);

    // Dynamically import the actual component only on client side
    const loadComponent = async () => {
      try {
        const walletModule = await import("./UnifiedWalletButton");
        setUnifiedWalletButton(() => walletModule.UnifiedWalletButton);
      } catch (error) {
        console.warn("Failed to load UnifiedWalletButton:", error);
      }
    };

    if (mounted) {
      loadComponent();
    }
  }, [mounted]);

  // Show loading state during SSR and while component is loading
  if (!mounted || !UnifiedWalletButton) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-50 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20"
            : "text-muted-foreground border-border bg-background"
        } ${className || ""}`}
        disabled
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  // Render the actual component once loaded
  return (
    <UnifiedWalletButton variant={variant} size={size} className={className} />
  );
}
