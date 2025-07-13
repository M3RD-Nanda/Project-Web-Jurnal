"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown } from "lucide-react";
import { formatAddress } from "@/lib/web3-config";
import { useWeb3Context } from "@/components/Web3Provider";

interface CustomConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

// Safe wrapper for ConnectButton that handles SSR and provider context
function SafeConnectButton({
  size,
  className,
}: {
  size: "default" | "sm" | "lg";
  className: string;
}) {
  const [ConnectButton, setConnectButton] = useState<any>(null);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  useEffect(() => {
    setMounted(true);

    const loadConnectButton = async () => {
      try {
        // Only load if Web3 is available
        if (!isWeb3Available || isLoading) {
          return;
        }

        // Add a small delay to ensure Web3Provider is fully mounted
        await new Promise((resolve) => setTimeout(resolve, 100));
        const { ConnectButton: CB } = await import("@rainbow-me/rainbowkit");
        setConnectButton(() => CB);
      } catch (err) {
        console.error("Failed to load ConnectButton:", err);
        setError(true);
      }
    };

    if (mounted && !isLoading) {
      loadConnectButton();
    }
  }, [mounted, isWeb3Available, isLoading]);

  // Show loading state while Web3 is initializing
  if (!mounted || isLoading) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-50 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20"
            : "text-muted-foreground border-border bg-background"
        } ${className}`}
        disabled
      >
        <Wallet className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  // Show disabled state if Web3 is not available
  if (!isWeb3Available || error || !ConnectButton) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`gap-2 font-semibold text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent opacity-50 ${
          className?.includes("header-wallet")
            ? "text-primary-foreground border-primary-foreground/20"
            : "text-muted-foreground border-border bg-background"
        } ${className}`}
        disabled
        title={
          !isWeb3Available ? "Web3 not available" : "Failed to load wallet"
        }
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }: any) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
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
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="ghost"
                    size={size}
                    className={`gap-1 font-medium text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent ${
                      className?.includes("header-wallet")
                        ? "border-red-400/30 text-red-400 hover:bg-red-400/10"
                        : "border-destructive/30 bg-background text-destructive hover:bg-destructive/10"
                    } ${className || ""}`}
                  >
                    Wrong network
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                );
              }

              return (
                <div className="flex gap-1">
                  <Button
                    onClick={openChainModal}
                    variant="ghost"
                    size={size}
                    className={`gap-1 font-medium text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent ${
                      className?.includes("header-wallet")
                        ? "text-primary-foreground hover:bg-primary-foreground/10 border-primary-foreground/20"
                        : "text-foreground hover:bg-muted border-border bg-background"
                    }`}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden lg:inline">{chain.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="ghost"
                    size={size}
                    className={`gap-1 font-medium text-[10px] lg:text-xs transition-colors px-1.5 lg:px-2 h-8 border bg-transparent ${
                      className?.includes("header-wallet")
                        ? "text-primary-foreground hover:bg-primary-foreground/10 border-primary-foreground/20"
                        : "text-foreground hover:bg-muted border-border bg-background"
                    }`}
                  >
                    <Wallet className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="max-w-[60px] lg:max-w-[80px] truncate">
                      {formatAddress(account.address)}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function WalletButton({
  variant = "default",
  size = "default",
  className = "",
}: CustomConnectButtonProps) {
  const [isClient, setIsClient] = useState(false);

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
        Connect Wallet
      </Button>
    );
  }

  return <SafeConnectButton size={size} className={className || ""} />;
}

// Simple wallet status component
export function WalletStatus() {
  const [isClient, setIsClient] = useState(false);
  const [ConnectButton, setConnectButton] = useState<any>(null);
  const { isWeb3Available, isLoading } = useWeb3Context();

  useEffect(() => {
    setIsClient(true);

    const loadConnectButton = async () => {
      try {
        // Only load if Web3 is available
        if (!isWeb3Available || isLoading) {
          return;
        }

        const { ConnectButton: CB } = await import("@rainbow-me/rainbowkit");
        setConnectButton(() => CB);
      } catch (err) {
        console.error("Failed to load ConnectButton for WalletStatus:", err);
      }
    };

    if (isClient && !isLoading) {
      loadConnectButton();
    }
  }, [isClient, isWeb3Available, isLoading]);

  if (!isClient || isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (!isWeb3Available || !ConnectButton) {
    return (
      <div className="text-sm text-muted-foreground">No wallet connected</div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted }: any) => {
        if (!mounted || !account || !chain) {
          return (
            <div className="text-sm text-muted-foreground">
              No wallet connected
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 text-sm">
            {chain.hasIcon && (
              <div
                style={{
                  background: chain.iconBackground,
                  width: 16,
                  height: 16,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                {chain.iconUrl && (
                  <img
                    alt={chain.name ?? "Chain icon"}
                    src={chain.iconUrl}
                    style={{ width: 16, height: 16 }}
                  />
                )}
              </div>
            )}
            <span className="text-muted-foreground">
              {chain.name} • {formatAddress(account.address)}
            </span>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export default WalletButton;
