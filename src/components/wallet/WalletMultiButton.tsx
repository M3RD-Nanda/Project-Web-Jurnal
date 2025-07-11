"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/SolanaProvider";
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

interface WalletMultiButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function WalletMultiButton({
  variant = "default",
  size = "default",
  className = "",
}: WalletMultiButtonProps) {
  const [isClient, setIsClient] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    select,
    wallets,
    wallet: selectedWallet,
  } = useWallet();

  const network = "devnet"; // Use devnet for now

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
        Loading...
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
                {selectedWallet?.adapter.name || "Solana"}
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
              <span className="font-medium">{selectedWallet?.adapter.name || "Solana Wallet"}</span>
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
                `${networkConfig.blockExplorer}/address/${publicKey.toString()}?cluster=${network}`,
                "_blank"
              );
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>
            Disconnect
          </DropdownMenuItem>
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
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect a Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {wallets.map((wallet) => (
            <Button
              key={wallet.adapter.name}
              variant="outline"
              className="justify-start gap-3 h-12"
              onClick={async () => {
                try {
                  select(wallet.adapter.name);
                  await connect();
                  setIsWalletModalOpen(false);
                } catch (error) {
                  console.error("Failed to connect wallet:", error);
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
                <span className="ml-auto text-xs text-green-600">Installed</span>
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
