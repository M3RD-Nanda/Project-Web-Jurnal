"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, Copy, ExternalLink, ChevronDown } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useAccountSafe,
  useChainIdSafe,
  useDisconnectSafe,
  useConnectSafe,
} from "@/hooks/useWagmiSafe";
import { WalletButton } from "./WalletButton";
import { SolanaWalletButton } from "./SolanaWalletButton";
import { formatAddress, getChainConfig } from "@/lib/web3-config";
import {
  getSolanaNetworkConfig,
  formatSolanaAddress,
} from "@/lib/solana-config";
import { toast } from "sonner";
import { useWalletSafe } from "@/hooks/useSolanaSafe";
import {
  WalletErrorBoundary,
  useWalletErrorHandler,
} from "./WalletErrorBoundary";
import { useEvmWallets } from "@/hooks/useEvmWallets";

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
  const [isWalletInfoModalOpen, setIsWalletInfoModalOpen] = useState(false);
  const [isWalletConnectionModalOpen, setIsWalletConnectionModalOpen] =
    useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<
    "evm" | "solana" | null
  >(null);

  // Use wallet error handler
  const { handleWalletError } = useWalletErrorHandler();

  // Get EVM wallets with dynamic detection
  const evmWallets = useEvmWallets();

  // Check EVM wallet connection
  const { isConnected: isEvmConnected, address: evmAddress } = useAccountSafe();
  const chainId = useChainIdSafe();
  const { disconnect: disconnectEvm } = useDisconnectSafe();
  const { connect: connectEvm } = useConnectSafe();
  const chain = getChainConfig(chainId);

  // Check Solana wallet connection
  const {
    connected: isSolanaConnected,
    publicKey: solanaPublicKey,
    disconnect: disconnectSolana,
    wallet: solanaWallet,
    wallets: solanaWallets,
    select: selectSolanaWallet,
    connect: connectSolanaWallet,
  } = useWalletSafe();

  // Check if any wallet is connected
  const isAnyWalletConnected =
    (isEvmConnected && evmAddress) || (isSolanaConnected && solanaPublicKey);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  // Only reset if no modal is open
  useEffect(() => {
    if (
      selectedWalletType &&
      !isWalletConnectionModalOpen &&
      !isWalletTypeModalOpen
    ) {
      // Set a timeout to reset the selected wallet type after 10 seconds
      // This gives user time to interact with wallet modal, but resets if they close it
      const timeout = setTimeout(() => {
        setSelectedWalletType(null);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [selectedWalletType, isWalletConnectionModalOpen, isWalletTypeModalOpen]);

  // Handle wallet info modal close
  const handleWalletInfoModalClose = (open: boolean) => {
    setIsWalletInfoModalOpen(open);
  };

  // Handle button click
  const handleButtonClick = () => {
    if (isAnyWalletConnected) {
      setIsWalletInfoModalOpen(true);
    } else if (selectedWalletType) {
      // If a wallet type is already selected, open the connection modal
      setIsWalletConnectionModalOpen(true);
    } else {
      setIsWalletTypeModalOpen(true);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      if (isEvmConnected) {
        await disconnectEvm();
      }
      if (isSolanaConnected) {
        await disconnectSolana();
      }
      setIsWalletInfoModalOpen(false);
      toast.success("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  // Handle modal close to prevent double popup issue
  const handleConnectionModalClose = useCallback((open: boolean) => {
    setIsWalletConnectionModalOpen(open);
    if (!open) {
      // Small delay to prevent double popup issue
      setTimeout(() => {
        setSelectedWalletType(null);
      }, 100);
    }
  }, []);

  const handleTypeModalClose = useCallback((open: boolean) => {
    setIsWalletTypeModalOpen(open);
    if (!open) {
      setSelectedWalletType(null);
    }
  }, []);

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

      {/* Wallet Info Modal */}
      <Dialog
        open={isWalletInfoModalOpen}
        onOpenChange={handleWalletInfoModalClose}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connected Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* EVM Wallet Info */}
            {isEvmConnected && evmAddress && chain && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          style={{ width: 24, height: 24 }}
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">EVM Wallet</div>
                    <div className="text-sm text-muted-foreground">
                      {chain.name} • {formatAddress(evmAddress)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const explorerUrl = chain.blockExplorers?.default?.url;
                      if (explorerUrl) {
                        window.open(
                          `${explorerUrl}/address/${evmAddress}`,
                          "_blank"
                        );
                      }
                    }}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                </div>
              </div>
            )}

            {/* Solana Wallet Info */}
            {isSolanaConnected && solanaPublicKey && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">◎</div>
                  <div className="flex-1">
                    <div className="font-medium">Solana Wallet</div>
                    <div className="text-sm text-muted-foreground">
                      {solanaWallet?.adapter?.name} •{" "}
                      {formatSolanaAddress(solanaPublicKey.toString())}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const networkConfig = getSolanaNetworkConfig("mainnet");
                      window.open(
                        `${
                          networkConfig.blockExplorer
                        }/address/${solanaPublicKey.toString()}`,
                        "_blank"
                      );
                    }}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="destructive"
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect Wallet
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
              Connect {selectedWalletType === "evm" ? "EVM" : "Solana"} Wallet
            </DialogTitle>
            <DialogDescription>
              Choose your preferred wallet to connect.
            </DialogDescription>
          </DialogHeader>
          <WalletErrorBoundary>
            <div className="space-y-4">
              {selectedWalletType === "evm" ? (
                <div className="grid gap-3">
                  {evmWallets.map((wallet) => (
                    <Button
                      key={wallet.id}
                      variant="outline"
                      className="justify-start gap-3 h-12"
                      onClick={async () => {
                        if (!wallet.connector) {
                          // If no connector available, show message to install wallet
                          toast.error(
                            `${wallet.name} is not available. Please install it first.`
                          );
                          return;
                        }

                        try {
                          // Close our modal first to prevent overlap
                          setIsWalletConnectionModalOpen(false);

                          // Use connector directly without RainbowKit modal
                          await connectEvm({ connector: wallet.connector });
                        } catch (error: any) {
                          const errorInfo = handleWalletError(
                            error,
                            wallet.name
                          );

                          // Handle error based on type
                          switch (errorInfo.type) {
                            case "connection_reset":
                            case "walletconnect_error":
                              // Don't reopen modal for WalletConnect errors, let user manually retry
                              setIsWalletConnectionModalOpen(false);
                              toast.error(errorInfo.message);
                              break;
                            case "user_rejected":
                              // User cancelled - don't show error, just close modal
                              setIsWalletConnectionModalOpen(false);
                              break;
                            case "not_installed":
                              // Wallet not installed - show error and keep modal open
                              toast.error(errorInfo.message);
                              setIsWalletConnectionModalOpen(true);
                              break;
                            default:
                              // Unknown error - show error and allow retry
                              toast.error(errorInfo.message);
                              setIsWalletConnectionModalOpen(
                                errorInfo.shouldRetry
                              );
                              break;
                          }
                        }
                      }}
                    >
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          // Fallback to a default icon if the image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMzJjOC44MzcgMCAxNi03LjE2MyAxNi0xNlMyNC44MzcgMCAxNiAwIDAgNy4xNjMgMCAxNnM3LjE2MyAxNiAxNiAxNloiIGZpbGw9IiM2MzY2RjEiLz48cGF0aCBkPSJNMTYgMjRjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDhaIiBmaWxsPSIjZmZmIi8+PC9zdmc+";
                        }}
                      />
                      <span className="font-medium">{wallet.name}</span>
                      {wallet.isInstalled && (
                        <span className="ml-auto text-xs text-green-600">
                          Installed
                        </span>
                      )}
                    </Button>
                  ))}
                  {evmWallets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No EVM wallets detected.</p>
                      <p className="text-xs mt-1">
                        Please install a wallet like MetaMask or Coinbase
                        Wallet.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {solanaWallets.map((wallet) => (
                    <Button
                      key={wallet.adapter.name}
                      variant="outline"
                      className="justify-start gap-3 h-12"
                      onClick={async () => {
                        try {
                          // Ensure we have the select function available
                          if (!selectSolanaWallet) {
                            console.error(
                              "Wallet select function not available"
                            );
                            return;
                          }

                          // First select the wallet
                          selectSolanaWallet(wallet.adapter.name);

                          // Wait a brief moment for wallet selection to complete
                          await new Promise((resolve) =>
                            setTimeout(resolve, 150)
                          );

                          // Ensure we have the connect function available
                          if (!connectSolanaWallet) {
                            console.error(
                              "Wallet connect function not available"
                            );
                            return;
                          }

                          // Then connect to the selected wallet
                          await connectSolanaWallet();
                          setIsWalletConnectionModalOpen(false);
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
                              selectSolanaWallet(wallet.adapter.name);
                              await new Promise((resolve) =>
                                setTimeout(resolve, 500)
                              );
                              await connectSolanaWallet();
                              setIsWalletConnectionModalOpen(false);
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
                  {solanaWallets.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No Solana wallets detected.</p>
                      <p className="text-xs mt-1">
                        Please install a Solana wallet like Phantom or Solflare.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </WalletErrorBoundary>
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
        {isAnyWalletConnected ? "Check Wallet" : "Connect Wallet"}
      </Button>
    </>
  );
}
