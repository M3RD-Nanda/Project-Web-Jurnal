"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useAccountSafe } from "@/hooks/useWagmiSafe";
import { useWallet } from "@solana/wallet-adapter-react";

// Global Wallet State Interface
interface WalletGlobalState {
  // Connection Status
  isConnected: boolean;
  isEvmConnected: boolean;
  isSolanaConnected: boolean;
  isAnyConnected: boolean;

  // Addresses
  evmAddress: string | null;
  solanaAddress: string | null;

  // Connection Methods
  connectPhantomEvm: () => Promise<void>;
  connectPhantomSolana: () => Promise<void>;
  disconnectAll: () => Promise<void>;

  // Loading States
  isConnecting: boolean;
  isDisconnecting: boolean;

  // Error States
  error: string | null;

  // Refresh Method
  refresh: () => void;
}

const WalletGlobalContext = createContext<WalletGlobalState | null>(null);

// Custom hook to use the global wallet context
export const useWalletGlobal = () => {
  const context = useContext(WalletGlobalContext);
  if (!context) {
    throw new Error("useWalletGlobal must be used within WalletGlobalProvider");
  }
  return context;
};

// Safe hook that returns default values if context is not available
export const useWalletGlobalSafe = () => {
  const context = useContext(WalletGlobalContext);
  if (!context) {
    return {
      isConnected: false,
      isEvmConnected: false,
      isSolanaConnected: false,
      isAnyConnected: false,
      evmAddress: null,
      solanaAddress: null,
      connectPhantomEvm: async () => {},
      connectPhantomSolana: async () => {},
      disconnectAll: async () => {},
      isConnecting: false,
      isDisconnecting: false,
      error: null,
      refresh: () => {},
    };
  }
  return context;
};

interface WalletGlobalProviderProps {
  children: React.ReactNode;
}

export function WalletGlobalProvider({ children }: WalletGlobalProviderProps) {
  // Local state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Wallet hooks
  const phantom = usePhantomWallet();
  const wagmi = useAccountSafe();
  const solanaAdapter = useWallet();

  // Derived state - unified connection status
  const isEvmConnected = phantom.ethereum.isConnected || wagmi.isConnected;
  const evmAddress = phantom.ethereum.address || wagmi.address || null;

  const isSolanaConnected =
    phantom.solana.isConnected || solanaAdapter.connected;
  const solanaAddress =
    phantom.solana.publicKey || solanaAdapter.publicKey?.toString() || null;

  const isAnyConnected = isEvmConnected || isSolanaConnected;
  const isConnected = isAnyConnected;

  // Persistence key
  const STORAGE_KEY = "wallet-global-state";

  // Load persisted state
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log("🔄 Loaded persisted wallet state:", parsed);
        }
      } catch (error) {
        console.error("Failed to load persisted wallet state:", error);
      }
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stateToSave = {
        isEvmConnected,
        isSolanaConnected,
        evmAddress,
        solanaAddress,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        console.log("💾 Persisted wallet state:", stateToSave);
      } catch (error) {
        console.error("Failed to persist wallet state:", error);
      }
    }
  }, [isEvmConnected, isSolanaConnected, evmAddress, solanaAddress]);

  // Connection methods
  const connectPhantomEvm = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await phantom.ethereum.connect();
      console.log("✅ Phantom EVM connected");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect Phantom EVM";
      setError(errorMsg);
      console.error("❌ Phantom EVM connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [phantom.ethereum]);

  const connectPhantomSolana = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await phantom.solana.connect();
      console.log("✅ Phantom Solana connected");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to connect Phantom Solana";
      setError(errorMsg);
      console.error("❌ Phantom Solana connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [phantom.solana]);

  const disconnectAll = useCallback(async () => {
    setIsDisconnecting(true);
    setError(null);
    try {
      // Disconnect all wallets
      if (phantom.ethereum.isConnected) {
        await phantom.ethereum.disconnect();
      }
      if (phantom.solana.isConnected) {
        await phantom.solana.disconnect();
      }
      if (solanaAdapter.connected && solanaAdapter.disconnect) {
        await solanaAdapter.disconnect();
      }

      // Clear persisted state
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }

      console.log("✅ All wallets disconnected");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to disconnect wallets";
      setError(errorMsg);
      console.error("❌ Wallet disconnection failed:", err);
    } finally {
      setIsDisconnecting(false);
    }
  }, [phantom.ethereum, phantom.solana, solanaAdapter]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    console.log("🔄 Wallet state refreshed");
  }, []);

  const contextValue: WalletGlobalState = {
    isConnected,
    isEvmConnected,
    isSolanaConnected,
    isAnyConnected,
    evmAddress,
    solanaAddress,
    connectPhantomEvm,
    connectPhantomSolana,
    disconnectAll,
    isConnecting,
    isDisconnecting,
    error,
    refresh,
  };

  return (
    <WalletGlobalContext.Provider value={contextValue}>
      {children}
    </WalletGlobalContext.Provider>
  );
}
