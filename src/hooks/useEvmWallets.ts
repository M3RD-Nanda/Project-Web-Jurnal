"use client";

import { useState, useEffect, useMemo } from "react";
import { Connector } from "wagmi";
import { useConnectorsSafe } from "./useWagmiSafe";
import { useEIP6963Wallets } from "./useEIP6963Wallets";
import { getWalletConfig, DEFAULT_WALLET_ICON } from "@/lib/wallet-icons";

export interface EvmWalletInfo {
  id: string;
  name: string;
  icon: string;
  isInstalled: boolean;
  connector: Connector;
  readyState: "Installed" | "NotDetected" | "Loadable";
}

// Note: Wallet metadata is now centralized in @/lib/wallet-icons.ts

/**
 * Hook to get available EVM wallets with dynamic detection
 * Similar to Solana wallet adapter but for EVM wallets
 */
export function useEvmWallets(): EvmWalletInfo[] {
  const connectors = useConnectorsSafe();
  const { providers: eip6963Providers, mounted: eip6963Mounted } =
    useEIP6963Wallets();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if a wallet is installed
  const isWalletInstalled = (connector: Connector): boolean => {
    if (typeof window === "undefined" || !mounted) return false;

    const name = connector.name.toLowerCase();
    const ethereum = (window as any).ethereum;

    // MetaMask - check for specific MetaMask provider
    if (name.includes("metamask")) {
      return !!(ethereum?.isMetaMask && !ethereum?.isBraveWallet);
    }

    // Coinbase Wallet - check for specific Coinbase provider
    if (name.includes("coinbase")) {
      return (
        !!(window as any).coinbaseWalletExtension ||
        !!ethereum?.isCoinbaseWallet
      );
    }

    // Brave Wallet - improved detection
    if (
      name.includes("brave") ||
      (name.includes("injected") && ethereum?.isBraveWallet)
    ) {
      return !!ethereum?.isBraveWallet;
    }

    // WalletConnect - it's a protocol, not an installed extension
    // Only show as "available" not "installed"
    if (name.includes("walletconnect")) {
      return false; // Don't show as "Installed" since it's not a browser extension
    }

    // Safe wallet
    if (name.includes("safe")) {
      return !!(window as any).SafeAppsSDK;
    }

    // For other injected wallets, check if ethereum provider exists
    if (name.includes("injected") && ethereum) {
      return true;
    }

    return false;
  };

  // Get wallet icon with centralized configuration - FORCED PRIORITY
  const getWalletIconFromConnector = (connector: Connector): string => {
    console.log("Getting icon for connector:", {
      name: connector.name,
      id: connector.id,
      connectorIcon: connector.icon,
    });

    // FIRST PRIORITY: Force use our centralized wallet configuration (HIGHEST PRIORITY)
    const walletConfig = getWalletConfig(connector.name);
    if (walletConfig.icon !== DEFAULT_WALLET_ICON) {
      console.log(
        "FORCED: Using centralized icon for",
        connector.name,
        ":",
        walletConfig.icon
      );
      return walletConfig.icon;
    }

    // Second, try to find matching EIP-6963 provider for real icon (MEDIUM PRIORITY)
    const eip6963Provider = eip6963Providers.find((provider) => {
      const providerName = provider.name.toLowerCase();
      const connectorName = connector.name.toLowerCase();

      // More comprehensive matching
      return (
        providerName.includes(connectorName) ||
        connectorName.includes(providerName) ||
        (connectorName.includes("metamask") &&
          provider.rdns === "io.metamask") ||
        (connectorName.includes("brave") &&
          provider.rdns === "com.brave.wallet") ||
        (connectorName.includes("coinbase") &&
          provider.rdns === "com.coinbase.wallet") ||
        (connectorName.includes("walletconnect") &&
          provider.rdns === "com.walletconnect")
      );
    });

    if (eip6963Provider && eip6963Provider.icon) {
      console.log(
        "Using EIP-6963 icon for",
        connector.name,
        ":",
        eip6963Provider.icon
      );
      return eip6963Provider.icon;
    }

    // Third, try to get icon from connector (LOW PRIORITY)
    if (connector.icon) {
      console.log(
        "Using connector icon for",
        connector.name,
        ":",
        connector.icon
      );
      return connector.icon;
    }

    // Fallback to default icon
    console.log("Using default icon for", connector.name);
    return DEFAULT_WALLET_ICON;
  };

  // Get wallet display name using centralized configuration
  const getWalletDisplayName = (connector: Connector): string => {
    // Use centralized wallet configuration first
    const walletConfig = getWalletConfig(connector.name);
    if (walletConfig.displayName !== connector.name) {
      return walletConfig.displayName;
    }

    // Special case for injected wallets - check for Brave
    if (connector.name.toLowerCase().includes("injected")) {
      const ethereum = (window as any).ethereum;
      if (ethereum?.isBraveWallet) {
        return "Brave Wallet";
      }
      return "Browser Wallet";
    }

    // Fallback to connector name with proper capitalization
    return connector.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const wallets = useMemo(() => {
    if (!mounted || !eip6963Mounted) return [];

    console.log("Building wallet list with:", {
      connectorsCount: connectors.length,
      eip6963ProvidersCount: eip6963Providers.length,
      connectors: connectors.map((c) => ({ name: c.name, id: c.id })),
      eip6963Providers: eip6963Providers.map((p) => ({
        name: p.name,
        rdns: p.rdns,
      })),
    });

    // Track seen wallets to prevent duplicates
    const seenWallets = new Set<string>();

    return connectors
      .filter((connector) => {
        // Filter out duplicate or unwanted connectors
        const name = connector.name.toLowerCase();
        const id = connector.id;

        // Skip mock connectors in development
        if (name.includes("mock")) return false;

        // Prevent duplicates - use a combination of name and type for uniqueness
        const walletKey = `${name}-${id}`;
        if (seenWallets.has(walletKey)) {
          console.log(`Skipping duplicate wallet: ${name} (${id})`);
          return false;
        }

        // Special handling for Brave Wallet duplicates
        if (name.includes("brave")) {
          // Only allow one Brave wallet entry
          const braveKey = "brave-wallet";
          if (seenWallets.has(braveKey)) {
            console.log(`Skipping duplicate Brave wallet: ${name}`);
            return false;
          }
          seenWallets.add(braveKey);
        }

        seenWallets.add(walletKey);
        return true;
      })
      .map((connector): EvmWalletInfo => {
        const isInstalled = isWalletInstalled(connector);
        const icon = getWalletIconFromConnector(connector);
        const displayName = getWalletDisplayName(connector);

        console.log(`Wallet mapped: ${displayName}`, {
          id: connector.id,
          isInstalled,
          icon: icon.substring(0, 50) + "...",
          originalName: connector.name,
        });

        return {
          id: connector.id,
          name: displayName,
          icon,
          isInstalled,
          connector,
          readyState: isInstalled ? "Installed" : "NotDetected",
        };
      })
      .sort((a, b) => {
        // Sort installed wallets first
        if (a.isInstalled && !b.isInstalled) return -1;
        if (!a.isInstalled && b.isInstalled) return 1;

        // Then sort by name
        return a.name.localeCompare(b.name);
      });
  }, [connectors, mounted, eip6963Mounted, eip6963Providers]);

  return wallets;
}

/**
 * Hook to get only installed EVM wallets
 */
export function useInstalledEvmWallets(): EvmWalletInfo[] {
  const allWallets = useEvmWallets();
  return useMemo(
    () => allWallets.filter((wallet) => wallet.isInstalled),
    [allWallets]
  );
}

/**
 * Hook to get a specific EVM wallet by name
 */
export function useEvmWallet(walletName: string): EvmWalletInfo | undefined {
  const wallets = useEvmWallets();
  return useMemo(
    () =>
      wallets.find(
        (wallet) =>
          wallet.name.toLowerCase().includes(walletName.toLowerCase()) ||
          wallet.id.toLowerCase().includes(walletName.toLowerCase())
      ),
    [wallets, walletName]
  );
}
