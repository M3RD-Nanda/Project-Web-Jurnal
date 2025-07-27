"use client";

import { useState, useEffect } from "react";
import { getWalletConfig, DEFAULT_WALLET_ICON } from "@/lib/wallet-icons";

// EIP-6963 types
interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

interface EIP6963AnnounceProviderEvent extends CustomEvent {
  type: "eip6963:announceProvider";
  detail: EIP6963ProviderDetail;
}

export interface WalletProvider {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
  provider: any;
  isInstalled: boolean;
}

/**
 * Hook to detect wallets using EIP-6963 standard
 * This provides real wallet icons and proper detection
 */
export function useEIP6963Wallets() {
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    const discoveredProviders = new Map<string, WalletProvider>();

    // Function to handle provider announcements
    const handleProviderAnnouncement = (
      event: EIP6963AnnounceProviderEvent
    ) => {
      const { info, provider } = event.detail;

      const walletProvider: WalletProvider = {
        uuid: info.uuid,
        name: info.name,
        icon: info.icon,
        rdns: info.rdns,
        provider,
        isInstalled: true, // If announced via EIP-6963, it's installed
      };

      discoveredProviders.set(info.uuid, walletProvider);
      setProviders(Array.from(discoveredProviders.values()));
    };

    // Listen for provider announcements
    window.addEventListener(
      "eip6963:announceProvider",
      handleProviderAnnouncement as EventListener
    );

    // Request providers to announce themselves immediately
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Also request after a short delay to catch late-loading extensions
    setTimeout(() => {
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    }, 100);

    // Cleanup
    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleProviderAnnouncement as EventListener
      );
    };
  }, []);

  // Add fallback wallets for common ones that might not support EIP-6963 yet
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const fallbackWallets: WalletProvider[] = [];
    const ethereum = (window as any).ethereum;

    // Check for MetaMask (if not already detected via EIP-6963)
    if (ethereum?.isMetaMask && !ethereum?.isBraveWallet) {
      const hasMetaMask = providers.some(
        (p) =>
          p.name.toLowerCase().includes("metamask") || p.rdns === "io.metamask"
      );
      if (!hasMetaMask) {
        const metamaskConfig = getWalletConfig("MetaMask");
        fallbackWallets.push({
          uuid: "metamask-fallback",
          name: metamaskConfig.displayName,
          icon: metamaskConfig.icon,
          rdns: "io.metamask",
          provider: ethereum,
          isInstalled: true,
        });
      }
    }

    // Check for Brave Wallet (if not already detected via EIP-6963)
    if (ethereum?.isBraveWallet) {
      const hasBrave = providers.some(
        (p) =>
          p.name.toLowerCase().includes("brave") ||
          p.rdns === "com.brave.wallet"
      );
      if (!hasBrave) {
        const braveConfig = getWalletConfig("Brave Wallet");
        fallbackWallets.push({
          uuid: "brave-fallback",
          name: braveConfig.displayName,
          icon: braveConfig.icon,
          rdns: "com.brave.wallet",
          provider: ethereum,
          isInstalled: true,
        });
      }
    }

    // Check for Coinbase Wallet (if not already detected via EIP-6963)
    if (ethereum?.isCoinbaseWallet || (window as any).coinbaseWalletExtension) {
      const hasCoinbase = providers.some(
        (p) =>
          p.name.toLowerCase().includes("coinbase") ||
          p.rdns === "com.coinbase.wallet"
      );
      if (!hasCoinbase) {
        const coinbaseConfig = getWalletConfig("Coinbase Wallet");
        fallbackWallets.push({
          uuid: "coinbase-fallback",
          name: coinbaseConfig.displayName,
          icon: coinbaseConfig.icon,
          rdns: "com.coinbase.wallet",
          provider: ethereum,
          isInstalled: true,
        });
      }
    }

    if (fallbackWallets.length > 0) {
      setProviders((prev) => {
        // Deduplicate by rdns to prevent duplicate keys
        const existingRdns = new Set(prev.map((p) => p.rdns));
        const newWallets = fallbackWallets.filter(
          (wallet) => !existingRdns.has(wallet.rdns)
        );
        return [...prev, ...newWallets];
      });
    }
  }, [mounted, providers]);

  // Always include WalletConnect as it's a protocol, not an injected wallet
  const walletConnectConfig = getWalletConfig("WalletConnect");
  const allProviders = [
    ...providers,
    {
      uuid: "walletconnect",
      name: walletConnectConfig.displayName,
      icon: walletConnectConfig.icon,
      rdns: "com.walletconnect",
      provider: null, // WalletConnect doesn't have an injected provider
      isInstalled: true, // Always available as a protocol
    },
  ];

  // Final deduplication by rdns to prevent React key conflicts
  const deduplicatedProviders = allProviders.reduce((acc, provider) => {
    const existingProvider = acc.find((p) => p.rdns === provider.rdns);
    if (!existingProvider) {
      acc.push(provider);
    }
    return acc;
  }, [] as WalletProvider[]);

  return {
    providers: deduplicatedProviders,
    mounted,
  };
}

/**
 * Get wallet icon URL with fallback - FORCED centralized configuration
 */
export function getWalletIcon(
  walletName: string,
  fallbackIcon?: string
): string {
  // FORCE: Always try centralized configuration first
  const walletConfig = getWalletConfig(walletName);

  // Always prioritize our centralized config
  if (walletConfig.icon !== DEFAULT_WALLET_ICON) {
    return walletConfig.icon;
  }

  // Otherwise use the provided fallback or default
  return fallbackIcon || DEFAULT_WALLET_ICON;
}
