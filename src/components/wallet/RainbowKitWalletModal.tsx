"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet } from "lucide-react";

interface RainbowKitWalletModalProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function RainbowKitWalletModal({
  variant = "outline",
  size = "default",
  className = "",
}: RainbowKitWalletModalProps) {
  const [mounted, setMounted] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-50 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20"
            : "text-muted-foreground border-border bg-background"
        } ${className || ""}`}
        disabled
      >
        <Wallet className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  const handleClick = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  if (isConnected) {
    return null; // Let the main wallet button handle connected state
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border ${
        className?.includes("header-wallet")
          ? "text-primary-foreground border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10"
          : "text-foreground border-border bg-background hover:bg-muted"
      } ${className || ""}`}
    >
      <Wallet className="h-4 w-4" />
      Connect EVM Wallet
    </Button>
  );
}
