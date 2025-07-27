"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Copy,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useEvmWallets } from "@/hooks/useEvmWallets";
import { useAccountSafe, useConnectSafe } from "@/hooks/useWagmiSafe";
import {
  formatSolanaAddress,
  formatEthereumAddress,
  redirectToPhantomDownload,
} from "@/lib/phantom-provider";
import {
  dispatchWalletEvent,
  createWalletEventDetail,
  type WalletConnectedEvent,
} from "@/types/wallet-events";

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
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isWalletTypeModalOpen, setIsWalletTypeModalOpen] = useState(false);
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const [isWalletConnectionModalOpen, setIsWalletConnectionModalOpen] =
    useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<
    "evm" | "solana" | null
  >(null);

  // Phantom wallet hooks - Direct integration based on official docs
  const { solana, ethereum, isAnyConnected, isAnyConnecting, isInstalled } =
    usePhantomWallet();

  // EVM wallets hooks
  const evmWallets = useEvmWallets();
  const { address: wagmiEvmAddress, isConnected: isWagmiEvmConnected } =
    useAccountSafe();
  const { connect: connectEvm } = useConnectSafe();

  // Legacy compatibility for existing code
  const isPhantomEvmConnected = ethereum.isConnected;
  const phantomEvmAddress = ethereum.address;
  const isSolanaConnected = solana.isConnected;
  const solanaPublicKey = solana.publicKey;

  // Combined EVM connection status
  const isEvmConnected = isPhantomEvmConnected || isWagmiEvmConnected;
  const evmAddress = phantomEvmAddress || wagmiEvmAddress;

  // Check if Phantom is installed (only log once with throttling)
  useEffect(() => {
    if (!isInstalled) {
      // Only log once every 30 seconds to prevent spam
      const now = Date.now();
      const lastWarning = (window as any).__phantomDetectionWarningTime || 0;
      if (now - lastWarning > 30000) {
        console.warn("⚠️ Phantom wallet not detected");
        (window as any).__phantomDetectionWarningTime = now;
      }
    }
  }, []); // Remove isInstalled dependency to prevent repeated warnings

  // Debug logging for Phantom wallet state changes
  useEffect(() => {
    console.log("🔍 Phantom Wallet State:", {
      solana: {
        connected: solana.isConnected,
        publicKey: solana.publicKey
          ? formatSolanaAddress(solana.publicKey)
          : null,
      },
      ethereum: {
        connected: ethereum.isConnected,
        address: ethereum.address
          ? formatEthereumAddress(ethereum.address)
          : null,
        chainId: ethereum.chainId,
      },
      isAnyConnected,
    });
  }, [
    solana.isConnected,
    solana.publicKey,
    ethereum.isConnected,
    ethereum.address,
    ethereum.chainId,
    isAnyConnected,
  ]);

  // Check if any wallet is connected (using Phantom state + EVM state)
  const isAnyWalletConnected = isAnyConnected || isEvmConnected;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-navigate to wallet dashboard when wallet connects in header
  useEffect(() => {
    if (
      mounted &&
      isAnyWalletConnected &&
      className?.includes("header-wallet")
    ) {
      // Longer delay to ensure connection is fully established and state is synced
      const timer = setTimeout(() => {
        console.log("Auto-navigating to wallet dashboard from header");
        router.push("/wallet");

        // Dispatch event to ensure wallet page is updated
        window.dispatchEvent(
          new CustomEvent("walletConnected", {
            detail: {
              evmConnected: isEvmConnected,
              solanaConnected: isSolanaConnected,
              evmAddress,
              solanaPublicKey: solanaPublicKey?.toString(),
              timestamp: Date.now(),
              walletType:
                isEvmConnected && isSolanaConnected
                  ? "both"
                  : isEvmConnected
                  ? "evm"
                  : isSolanaConnected
                  ? "solana"
                  : "none",
              connected: true,
            },
          })
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    mounted,
    isAnyWalletConnected,
    className,
    router,
    isEvmConnected,
    isSolanaConnected,
    evmAddress,
    solanaPublicKey,
  ]);

  // Force refresh wallet dashboard when wallet connects with debouncing
  useEffect(() => {
    if (className?.includes("header-wallet")) {
      console.log("🔄 Wallet state changed in header:", {
        isAnyWalletConnected,
        isEvmConnected,
        isSolanaConnected,
        evmAddress: evmAddress
          ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`
          : null,
        solanaPublicKey: solanaPublicKey
          ? `${solanaPublicKey.toString().slice(0, 6)}...${solanaPublicKey
              .toString()
              .slice(-4)}`
          : null,
      });

      // Debounce the event to prevent rapid firing
      const debounceTimer = setTimeout(() => {
        // Trigger a custom event to notify dashboard to refresh using helper function
        const eventDetail = createWalletEventDetail(
          isEvmConnected,
          isSolanaConnected,
          evmAddress,
          solanaPublicKey?.toString()
        );

        dispatchWalletEvent(eventDetail);
      }, 200); // 200ms debounce

      return () => clearTimeout(debounceTimer);
    }
  }, [
    isAnyWalletConnected,
    isEvmConnected,
    isSolanaConnected,
    evmAddress,
    solanaPublicKey,
    className,
  ]);

  // Listen for wallet events from dashboard to sync header state
  useEffect(() => {
    if (className?.includes("header-wallet")) {
      const handleWalletEvent = (event: CustomEvent) => {
        const { detail } = event;
        console.log("🔄 Header received wallet event from dashboard:", detail);

        // Force re-render by triggering a small state update
        // This ensures the header button reflects the latest wallet state
        setIsWalletTypeModalOpen(false);
        setIsWalletInfoModalOpen(false);
      };

      window.addEventListener(
        "walletConnected",
        handleWalletEvent as EventListener
      );

      return () => {
        window.removeEventListener(
          "walletConnected",
          handleWalletEvent as EventListener
        );
      };
    }
  }, [className]);

  // Close connection modal when wallet connects
  useEffect(() => {
    if (isAnyWalletConnected && isWalletConnectionModalOpen) {
      setIsWalletConnectionModalOpen(false);
    }
  }, [isAnyWalletConnected, isWalletConnectionModalOpen]);

  // Reset selected wallet type when component unmounts or when wallets disconnect
  useEffect(() => {
    if (!isEvmConnected && !isSolanaConnected) {
      setSelectedWalletType(null);
    }
  }, [isEvmConnected, isSolanaConnected]);

  // Reset selected wallet type after a delay to allow user to interact with wallet modal
  // Only reset if no modal is open and no wallet is being connected
  useEffect(() => {
    if (
      selectedWalletType &&
      !isWalletConnectionModalOpen &&
      !isWalletTypeModalOpen &&
      !isWalletInfoModalOpen
    ) {
      // Set a timeout to reset the selected wallet type after 15 seconds
      // This gives user time to interact with wallet modal, but resets if they close it
      const timeout = setTimeout(() => {
        setSelectedWalletType(null);
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [
    selectedWalletType,
    isWalletConnectionModalOpen,
    isWalletTypeModalOpen,
    isWalletInfoModalOpen,
  ]);

  // Handle wallet info modal close
  const handleWalletInfoModalClose = (open: boolean) => {
    setIsWalletInfoModalOpen(open);
  };

  // Handle button click
  const handleButtonClick = () => {
    if (isAnyWalletConnected) {
      // Always show wallet status modal when connected
      setIsWalletConnectionModalOpen(true);
    } else {
      // Always reset and show wallet type selection modal for new connections
      setSelectedWalletType(null);
      setIsWalletTypeModalOpen(true);
    }
  };

  // Handle Phantom wallet connections
  const handleConnectSolana = async () => {
    if (!isInstalled) {
      redirectToPhantomDownload();
      return;
    }

    try {
      await solana.connect();
      toast.success("Phantom Solana wallet connected!");
      setIsWalletConnectionModalOpen(false);
      setIsWalletTypeModalOpen(false);

      // Dispatch wallet connection event
      const eventDetail = createWalletEventDetail(
        ethereum.isConnected,
        true,
        ethereum.address,
        solana.publicKey
      );
      dispatchWalletEvent(eventDetail);
    } catch (error: any) {
      console.error("Failed to connect Phantom Solana:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else {
        toast.error("Failed to connect to Phantom Solana wallet");
      }
    }
  };

  const handleConnectEthereum = async () => {
    // Double-check installation status
    if (!isInstalled || !ethereum.isInstalled) {
      console.warn("⚠️ Phantom wallet not installed or not detected");
      toast.error(
        "Phantom wallet not detected. Please install Phantom wallet extension."
      );
      redirectToPhantomDownload();
      return;
    }

    try {
      await ethereum.connect();
      toast.success("Phantom Ethereum wallet connected!");
      setIsWalletConnectionModalOpen(false);
      setIsWalletTypeModalOpen(false);

      // Dispatch wallet connection event
      const eventDetail = createWalletEventDetail(
        true,
        solana.isConnected,
        ethereum.address,
        solana.publicKey
      );
      dispatchWalletEvent(eventDetail);
    } catch (error: any) {
      console.error("Failed to connect Phantom Ethereum:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else if (
        error.message?.includes("not detected") ||
        error.message?.includes("not installed")
      ) {
        toast.error(
          "Phantom wallet not detected. Please install Phantom wallet extension."
        );
        redirectToPhantomDownload();
      } else {
        toast.error("Failed to connect to Phantom Ethereum wallet");
      }
    }
  };

  // Handle EVM wallet connections (Brave, MetaMask, etc.)
  const handleConnectEvmWallet = async (walletId: string) => {
    try {
      const wallet = evmWallets.find((w) => w.id === walletId);
      if (!wallet) {
        toast.error("Wallet not found");
        return;
      }

      if (!wallet.isInstalled) {
        toast.error(
          `${wallet.name} is not installed. Please install the extension first.`
        );
        return;
      }

      await connectEvm({ connector: wallet.connector });
      toast.success(`${wallet.name} connected successfully!`);
      setIsWalletConnectionModalOpen(false);
      setIsWalletTypeModalOpen(false);

      // Dispatch wallet connection event with updated status
      const eventDetail = createWalletEventDetail(
        true, // EVM connected
        solana.isConnected,
        wagmiEvmAddress || phantomEvmAddress,
        solana.publicKey
      );
      dispatchWalletEvent(eventDetail);
    } catch (error: any) {
      console.error("Failed to connect EVM wallet:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else {
        toast.error("Failed to connect wallet");
      }
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      let solanaDisconnected = false;
      let hasErrors = false;

      // Disconnect Solana (Phantom supports programmatic disconnect)
      if (isSolanaConnected) {
        try {
          console.log("Attempting to disconnect Phantom Solana wallet...");
          await solana.disconnect();
          solanaDisconnected = true;
          console.log("Phantom Solana wallet disconnected successfully");
        } catch (solanaError) {
          console.error("Phantom Solana disconnect failed:", solanaError);
          hasErrors = true;
        }
      }

      // Note: Phantom Ethereum doesn't support programmatic disconnect
      if (isEvmConnected) {
        console.log(
          "Note: Phantom Ethereum requires manual disconnect through wallet UI"
        );
        toast.info(
          "Please disconnect Ethereum wallet manually through Phantom"
        );
      }

      // Close all modals
      setIsWalletConnectionModalOpen(false);
      setIsWalletTypeModalOpen(false);

      // Show appropriate success/error message
      if (solanaDisconnected) {
        toast.success("Phantom Solana wallet disconnected successfully");
      } else if (hasErrors) {
        toast.error("Failed to disconnect Phantom Solana wallet");
      }

      // Dispatch wallet disconnection event
      const eventDetail = createWalletEventDetail(
        ethereum.isConnected, // EVM might still be connected
        false, // Solana disconnected
        ethereum.address,
        null
      );
      dispatchWalletEvent(eventDetail);
    } catch (error) {
      console.error("Unexpected error during disconnect:", error);
      toast.error("Unexpected error occurred while disconnecting");
    }
  };

  // Handle modal close to prevent double popup issue
  const handleConnectionModalClose = useCallback((open: boolean) => {
    setIsWalletConnectionModalOpen(open);
    if (!open) {
      // Reset wallet type immediately when modal closes
      setSelectedWalletType(null);
    }
  }, []);

  const handleTypeModalClose = useCallback((open: boolean) => {
    setIsWalletTypeModalOpen(open);
    if (!open) {
      // Reset wallet type immediately when modal closes
      setSelectedWalletType(null);
    }
  }, []);

  // Show loading state during hydration - moved after all hooks
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

  // Handle copy address
  const handleCopyAddress = () => {
    const address =
      isEvmConnected && evmAddress
        ? evmAddress
        : isSolanaConnected && solanaPublicKey
        ? solanaPublicKey.toString()
        : "";

    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  // Always show the unified button, never delegate to individual wallet components

  // Handle wallet type selection
  const handleWalletTypeSelect = (type: "evm" | "solana") => {
    setIsWalletTypeModalOpen(false);
    setSelectedWalletType(type);
    // Add a small delay to ensure the first modal is fully closed
    setTimeout(() => {
      setIsWalletConnectionModalOpen(true);
    }, 100);
  };

  // Show unified button that changes text based on connection status
  return (
    <>
      {/* Wallet Type Selection Modal */}
      <Dialog open={isWalletTypeModalOpen} onOpenChange={handleTypeModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Wallet Type</DialogTitle>
            <DialogDescription>
              Select the type of cryptocurrency wallet you want to connect to
              JEBAKA.
            </DialogDescription>
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

      {/* Wallet Connection Modal */}
      <Dialog
        open={isWalletConnectionModalOpen}
        onOpenChange={handleConnectionModalClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isAnyWalletConnected
                ? "Wallet Status"
                : `Connect ${
                    selectedWalletType === "evm" ? "EVM" : "Solana"
                  } Wallet`}
            </DialogTitle>
            <DialogDescription>
              {isAnyWalletConnected
                ? "View your connected wallets and manage connections."
                : "Choose your preferred wallet to connect."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Show connected wallet status */}
            {isAnyWalletConnected && (
              <div className="space-y-3">
                {isEvmConnected && evmAddress && (
                  <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          EVM Wallet Connected
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {formatEthereumAddress(evmAddress)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsWalletConnectionModalOpen(false);
                          router.push("/wallet");
                        }}
                      >
                        Dashboard
                      </Button>
                    </div>
                  </div>
                )}

                {isSolanaConnected && solanaPublicKey && (
                  <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Solana Wallet Connected
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {formatSolanaAddress(solanaPublicKey)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsWalletConnectionModalOpen(false);
                          router.push("/wallet");
                        }}
                      >
                        Dashboard
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Connect additional wallets:
                  </p>
                </div>
              </div>
            )}

            {selectedWalletType === "evm" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Choose your preferred EVM wallet
                </p>

                {/* Show available EVM wallets */}
                <div className="space-y-3">
                  {evmWallets.length > 0 ? (
                    evmWallets.map((wallet) => (
                      <Button
                        key={wallet.id}
                        onClick={() => handleConnectEvmWallet(wallet.id)}
                        className="w-full justify-start gap-3 h-12"
                        variant="outline"
                        disabled={!wallet.isInstalled}
                      >
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-6 h-6"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling!.textContent = "🔗";
                          }}
                        />
                        <span className="hidden">🔗</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{wallet.name}</div>
                          {wallet.isInstalled && (
                            <div className="text-xs text-green-600">
                              Installed
                            </div>
                          )}
                          {!wallet.isInstalled && (
                            <div className="text-xs text-muted-foreground">
                              Not installed
                            </div>
                          )}
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No EVM wallets detected. Please install a wallet
                        extension.
                      </p>
                    </div>
                  )}
                </div>

                {/* Phantom Ethereum option */}
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Or connect to Phantom Ethereum wallet
                  </p>
                  {!isInstalled ? (
                    <Button
                      onClick={redirectToPhantomDownload}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Install Phantom Wallet
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConnectEthereum}
                      className="w-full"
                      size="lg"
                      disabled={ethereum.isConnecting}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {ethereum.isConnecting
                        ? "Connecting..."
                        : "Connect Phantom Ethereum"}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Connect to Phantom Solana wallet
                </p>
                {!isInstalled ? (
                  <Button
                    onClick={redirectToPhantomDownload}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Install Phantom Wallet
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectSolana}
                    className="w-full"
                    size="lg"
                    disabled={solana.isConnecting}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {solana.isConnecting
                      ? "Connecting..."
                      : "Connect Phantom Solana"}
                  </Button>
                )}
                <div className="text-xs text-muted-foreground text-center">
                  Official Phantom wallet integration for Solana
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Button */}
      <Button
        onClick={handleButtonClick}
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
    </>
  );
}
