"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccountSafe } from "@/hooks/useWagmiSafe";
import { WalletButton } from "./WalletButton";
import { SolanaWalletButton } from "./SolanaWalletButton";

interface UnifiedWalletButtonProps {
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

export function UnifiedWalletButton({
  variant = "outline",
  size = "sm",
  className = "",
}: UnifiedWalletButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isWalletTypeModalOpen, setIsWalletTypeModalOpen] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<
    "evm" | "solana" | null
  >(null);

  // Check EVM wallet connection
  const { isConnected: isEvmConnected, address: evmAddress } = useAccountSafe();

  // Check Solana wallet connection
  const { connected: isSolanaConnected, publicKey: solanaPublicKey } =
    useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset selected wallet type when component unmounts or when wallets disconnect
  useEffect(() => {
    if (!isEvmConnected && !isSolanaConnected) {
      setSelectedWalletType(null);
    }
  }, [isEvmConnected, isSolanaConnected]);

  // Reset selected wallet type after a delay to allow user to interact with wallet modal
  useEffect(() => {
    if (selectedWalletType) {
      // Set a timeout to reset the selected wallet type after 5 seconds
      // This gives user time to interact with wallet modal, but resets if they close it
      const timeout = setTimeout(() => {
        setSelectedWalletType(null);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [selectedWalletType]);

  // Show loading state during hydration
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
        Connect Wallet
      </Button>
    );
  }

  // If any wallet is connected, show the connected wallet component
  if (isEvmConnected && evmAddress) {
    return <WalletButton variant={variant} size={size} className={className} />;
  }

  if (isSolanaConnected && solanaPublicKey) {
    return (
      <SolanaWalletButton variant={variant} size={size} className={className} />
    );
  }

  // If a specific wallet type is selected, show that wallet component
  if (selectedWalletType === "evm") {
    return <WalletButton variant={variant} size={size} className={className} />;
  }

  if (selectedWalletType === "solana") {
    return (
      <SolanaWalletButton variant={variant} size={size} className={className} />
    );
  }

  // Handle wallet type selection
  const handleWalletTypeSelect = (type: "evm" | "solana") => {
    setIsWalletTypeModalOpen(false);
    setSelectedWalletType(type);
  };

  // Handle modal close - reset selected wallet type
  const handleModalClose = (open: boolean) => {
    setIsWalletTypeModalOpen(open);
    if (!open) {
      // Reset selected wallet type when modal closes
      setSelectedWalletType(null);
    }
  };

  // Show unified connect button with wallet type selector
  return (
    <Dialog open={isWalletTypeModalOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent ${
            className?.includes("header-wallet")
              ? "text-primary-foreground hover:bg-primary-foreground/10 border-primary-foreground/20"
              : "text-foreground hover:bg-muted border-border bg-background"
          } ${className || ""}`}
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Wallet Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col gap-2 hover:bg-accent"
            onClick={() => handleWalletTypeSelect("evm")}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">⟠</div>
              <div className="text-left">
                <div className="font-semibold">EVM Wallets</div>
                <div className="text-sm text-muted-foreground">
                  Ethereum, Polygon, BSC, etc.
                </div>
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col gap-2 hover:bg-accent"
            onClick={() => handleWalletTypeSelect("solana")}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">◎</div>
              <div className="text-left">
                <div className="font-semibold">Solana Wallets</div>
                <div className="text-sm text-muted-foreground">
                  Phantom, Solflare, etc.
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
