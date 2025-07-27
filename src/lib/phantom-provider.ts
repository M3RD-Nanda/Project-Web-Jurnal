"use client";

// Phantom Provider Detection and Utilities
// Based on official Phantom documentation

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomSolanaProvider;
      ethereum?: PhantomEthereumProvider;
    };
    ethereum?: any;
    solana?: PhantomSolanaProvider;
  }
}

// Solana Provider Interface
export interface PhantomSolanaProvider {
  isPhantom: boolean;
  publicKey: any;
  isConnected: boolean;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: any }>;
  disconnect(): Promise<void>;
  request(params: { method: string; params?: any }): Promise<any>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

// Ethereum Provider Interface
export interface PhantomEthereumProvider {
  isPhantom: boolean;
  selectedAddress: string | null;
  chainId: string;
  isConnected(): boolean;
  request(params: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

/**
 * Get Phantom Solana Provider
 * Based on: https://docs.phantom.com/solana/detecting-the-provider
 */
export const getPhantomSolanaProvider = (): PhantomSolanaProvider | null => {
  if (typeof window === "undefined") return null;

  // Only log debug info once every 30 seconds to prevent spam
  const now = Date.now();
  const lastDebugLog = (window as any).__phantomSolanaDebugLogTime || 0;
  if (now - lastDebugLog > 30000) {
    console.log("🔍 Checking for Phantom Solana provider...");
    console.log("window.phantom exists:", !!window.phantom);
    console.log("window.phantom.solana exists:", !!window.phantom?.solana);
    console.log(
      "window.phantom.solana.isPhantom:",
      window.phantom?.solana?.isPhantom
    );
    (window as any).__phantomSolanaDebugLogTime = now;
  }

  if ("phantom" in window) {
    const provider = window.phantom?.solana;
    if (provider?.isPhantom) {
      if (now - lastDebugLog > 30000) {
        console.log("✅ Phantom Solana provider found");
      }
      return provider;
    }
  }

  // Fallback to legacy window.solana for compatibility
  if ("solana" in window) {
    const provider = window.solana;
    if (provider?.isPhantom) {
      if (now - lastDebugLog > 30000) {
        console.log("✅ Legacy Phantom Solana provider found");
      }
      return provider;
    }
  }

  if (now - lastDebugLog > 30000) {
    console.log("⚠️ Phantom Solana provider not found");
  }
  return null;
};

/**
 * Get Phantom Ethereum Provider
 * Based on: https://docs.phantom.com/ethereum-monad-testnet-base-and-polygon/detecting-the-provider
 */
export const getPhantomEthereumProvider =
  (): PhantomEthereumProvider | null => {
    if (typeof window === "undefined") return null;

    // Only log debug info once every 30 seconds to prevent spam
    const now = Date.now();
    const lastDebugLog = (window as any).__phantomDebugLogTime || 0;
    if (now - lastDebugLog > 30000) {
      console.log("🔍 Checking for Phantom Ethereum provider...");
      console.log("window.phantom exists:", !!window.phantom);
      console.log(
        "window.phantom.ethereum exists:",
        !!window.phantom?.ethereum
      );
      console.log(
        "window.phantom.ethereum.isPhantom:",
        window.phantom?.ethereum?.isPhantom
      );
      (window as any).__phantomDebugLogTime = now;
    }

    // Preferred: window.phantom.ethereum
    if ("phantom" in window) {
      const provider = window.phantom?.ethereum;
      if (provider?.isPhantom) {
        // Only log success once every 30 seconds to prevent spam
        const lastSuccessLog = (window as any).__phantomSuccessLogTime || 0;
        if (now - lastSuccessLog > 30000) {
          console.log("✅ Phantom Ethereum provider found");
          (window as any).__phantomSuccessLogTime = now;
        }
        return provider;
      }
    }

    // Fallback: window.ethereum (prone to namespace collisions)
    if ("ethereum" in window) {
      const provider = window.ethereum;
      if (provider?.isPhantom) {
        // Only log success once every 30 seconds to prevent spam
        const lastLegacySuccessLog =
          (window as any).__phantomLegacySuccessLogTime || 0;
        if (now - lastLegacySuccessLog > 30000) {
          console.log("✅ Legacy Phantom Ethereum provider found");
          (window as any).__phantomLegacySuccessLogTime = now;
        }
        return provider;
      }
    }

    // Only log once every 60 seconds to prevent spam
    const lastWarning = (window as any).__phantomEthereumWarningTime || 0;
    if (now - lastWarning > 60000) {
      console.log(
        "ℹ️ Phantom Ethereum provider not detected (this is normal if not using Phantom for Ethereum)"
      );
      (window as any).__phantomEthereumWarningTime = now;
    }

    return null;
  };

/**
 * Check if Phantom is installed
 */
export const isPhantomInstalled = (): boolean => {
  return (
    getPhantomSolanaProvider() !== null || getPhantomEthereumProvider() !== null
  );
};

/**
 * Redirect to Phantom download page
 */
export const redirectToPhantomDownload = (): void => {
  window.open("https://phantom.app/", "_blank");
};

/**
 * Connect to Phantom Solana
 */
export const connectPhantomSolana = async (
  onlyIfTrusted: boolean = false
): Promise<{ publicKey: any } | null> => {
  const provider = getPhantomSolanaProvider();

  if (!provider) {
    redirectToPhantomDownload();
    return null;
  }

  try {
    const response = await provider.connect({ onlyIfTrusted });
    return response;
  } catch (error) {
    console.error("Failed to connect to Phantom Solana:", error);
    throw error;
  }
};

/**
 * Connect to Phantom Ethereum
 */
export const connectPhantomEthereum = async (): Promise<string[] | null> => {
  const provider = getPhantomEthereumProvider();

  if (!provider) {
    redirectToPhantomDownload();
    return null;
  }

  try {
    const accounts = await provider.request({
      method: "eth_requestAccounts",
    });
    return accounts;
  } catch (error) {
    console.error("Failed to connect to Phantom Ethereum:", error);
    throw error;
  }
};

/**
 * Disconnect from Phantom Solana
 */
export const disconnectPhantomSolana = async (): Promise<void> => {
  const provider = getPhantomSolanaProvider();

  if (!provider) return;

  try {
    await provider.disconnect();
  } catch (error) {
    console.error("Failed to disconnect from Phantom Solana:", error);
    throw error;
  }
};

/**
 * Get current Solana connection status
 */
export const getSolanaConnectionStatus = (): {
  isConnected: boolean;
  publicKey: string | null;
} => {
  const provider = getPhantomSolanaProvider();

  if (!provider) {
    return { isConnected: false, publicKey: null };
  }

  return {
    isConnected: provider.isConnected,
    publicKey: provider.publicKey?.toString() || null,
  };
};

/**
 * Get current Ethereum connection status
 */
export const getEthereumConnectionStatus = (): {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
} => {
  const provider = getPhantomEthereumProvider();

  if (!provider) {
    return { isConnected: false, address: null, chainId: null };
  }

  return {
    isConnected: provider.isConnected(),
    address: provider.selectedAddress,
    chainId: provider.chainId,
  };
};

/**
 * Format Solana address for display
 */
export const formatSolanaAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

/**
 * Format Ethereum address for display
 */
export const formatEthereumAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
