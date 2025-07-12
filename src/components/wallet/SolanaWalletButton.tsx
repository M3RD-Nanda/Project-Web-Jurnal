"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useWallet,
  useConnection,
  useSolanaContext,
} from "@/components/SolanaProvider";
import { useWalletSafe, useConnectionSafe } from "@/hooks/useSolanaSafe";
import {
  formatSolanaAddress,
  getSolanaNetworkConfig,
} from "@/lib/solana-config";
import { Wallet, ChevronDown, Copy, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SolanaWalletButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function SolanaWalletButton({
  variant = "default",
  size = "default",
  className = "",
}: SolanaWalletButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Safe wallet hooks with fallback - MUST be called before any conditional returns
  const walletState = useWalletSafe();
  const connectionState = useConnectionSafe();

  const {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    select,
    wallets,
  } = walletState;
  const { connection } = connectionState;

  // Use mainnet for real balance display
  const network = "mainnet";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state on server-side and until client-side hydration
  if (!isClient) {
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
        Connect Solana
      </Button>
    );
  }

  // If connecting, show connecting state
  if (connecting) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-75 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20"
            : "text-muted-foreground border-border bg-background"
        } ${className || ""}`}
        disabled
      >
        <Wallet className="h-4 w-4 animate-pulse" />
        Connecting...
      </Button>
    );
  }

  const networkConfig = getSolanaNetworkConfig(network);

  // If connected, show wallet info
  if (connected && publicKey) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border ${
              className?.includes("header-wallet")
                ? "text-primary-foreground border-primary-foreground/20 bg-primary-foreground/10"
                : "text-foreground border-border bg-background"
            } ${className || ""}`}
          >
            <span className="text-lg">{networkConfig.icon}</span>
            <div className="flex flex-col items-start">
              <span className="text-[8px] lg:text-[10px] opacity-70">
                {networkConfig.name}
              </span>
              <span className="text-[10px] lg:text-xs">
                {formatSolanaAddress(publicKey.toString())}
              </span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="flex items-center gap-2">
            <span className="text-lg">{networkConfig.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">Solana Wallet</span>
              <span className="text-xs text-muted-foreground">
                {formatSolanaAddress(publicKey.toString(), 6)}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(publicKey.toString());
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open(
                `${
                  networkConfig.blockExplorer
                }/address/${publicKey.toString()}${
                  network !== "mainnet" ? `?cluster=${network}` : ""
                }`,
                "_blank"
              );
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected, show connect button with wallet selection
  return (
    <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border ${
            className?.includes("header-wallet")
              ? "text-primary-foreground border-primary-foreground/20 bg-transparent hover:bg-primary-foreground/10"
              : "text-muted-foreground border-border bg-background hover:bg-accent"
          } ${className || ""}`}
        >
          <span className="text-lg">{networkConfig.icon}</span>
          Connect Solana
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a Solana Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={async () => {
                try {
                  // Ensure we have the select function available
                  if (!select) {
                    console.error("Wallet select function not available");
                    return;
                  }

                  // First select the wallet
                  select(wallet.adapter.name);

                  // Wait a brief moment for wallet selection to complete
                  await new Promise((resolve) => setTimeout(resolve, 150));

                  // Ensure we have the connect function available
                  if (!connect) {
                    console.error("Wallet connect function not available");
                    return;
                  }

                  // Then connect to the selected wallet
                  await connect();
                  setIsWalletModalOpen(false);
                } catch (error: any) {
                  console.error("Wallet connection error:", error);

                  // Handle different types of wallet errors
                  if (error.name === "WalletConnectionError") {
                    // User rejected the connection - this is normal behavior
                    console.log("User cancelled wallet connection");
                    // Don't close modal, let user try again or choose different wallet
                  } else if (error.name === "WalletNotReadyError") {
                    // Wallet not installed - redirect to install page
                    console.log(
                      "Wallet not installed, redirecting to install page"
                    );
                    // Modal will stay open for user to see other options
                  } else if (error.name === "WalletNotSelectedError") {
                    // Wallet not properly selected - retry with longer delay
                    console.log(
                      "Wallet not selected, retrying with longer delay..."
                    );
                    try {
                      // Try selecting again with a longer delay
                      select(wallet.adapter.name);
                      await new Promise((resolve) => setTimeout(resolve, 500));
                      await connect();
                      setIsWalletModalOpen(false);
                    } catch (retryError: any) {
                      console.error("Retry failed:", retryError);
                      // If retry fails, keep modal open for user to try manually
                    }
                  } else {
                    // Other errors - log for debugging
                    console.error("Failed to connect wallet:", error);
                  }
                }
              }}
            >
              {wallet.adapter.icon && (
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="w-6 h-6"
                />
              )}
              <span className="font-medium">{wallet.adapter.name}</span>
              {wallet.readyState === "Installed" && (
                <span className="ml-auto text-xs text-green-600">
                  Installed
                </span>
              )}
            </Button>
          ))}
          {wallets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No Solana wallets detected.</p>
              <p className="text-xs mt-1">
                Please install a Solana wallet like Phantom or Solflare.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple Solana wallet status component
export function SolanaWalletStatus() {
  const [isClient, setIsClient] = useState(false);
  const { publicKey, connected } = useWalletSafe();
  const network = "mainnet"; // Use mainnet for real balance

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (!connected || !publicKey) {
    return (
      <div className="text-sm text-muted-foreground">
        No Solana wallet connected
      </div>
    );
  }

  const networkConfig = getSolanaNetworkConfig(network);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{networkConfig.icon}</span>
      <span className="text-muted-foreground">
        {networkConfig.name} • {formatSolanaAddress(publicKey.toString())}
      </span>
    </div>
  );
}

// Compact version for sidebar or header
export function SolanaWalletBalanceCompact() {
  const [isClient, setIsClient] = useState(false);
  const { wallet, isSolanaAvailable, network } = useSolanaContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (
    !isClient ||
    !isSolanaAvailable ||
    !wallet.connected ||
    !wallet.publicKey
  ) {
    return null;
  }

  const networkConfig = getSolanaNetworkConfig(network);

  return (
    <div className="flex items-center gap-2 text-sm">
      <Wallet className="h-4 w-4" />
      <span className="text-lg">{networkConfig.icon}</span>
      <span>SOL</span>
    </div>
  );
}
