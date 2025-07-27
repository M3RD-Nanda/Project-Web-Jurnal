"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSendTransaction,
} from "wagmi";
import { useWeb3Context } from "@/components/Web3Provider";

/**
 * Safe wrapper for Wagmi hooks that handles provider context issues
 * Returns default values when provider is not available
 */

export function useAccountSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState({
    address: undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    isReconnecting: false,
    status: "disconnected" as const,
    connector: undefined,
  } as any);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useAccount();

  // Return wagmi data if mounted, regardless of Web3 availability
  // This allows the hook to work even when Web3Provider is still initializing
  if (mounted) {
    // If wagmi data shows connection, return it even if Web3 context is still loading
    if (wagmiData.isConnected && wagmiData.address) {
      return wagmiData;
    }
    // If Web3 is available and not loading, return wagmi data
    if (isWeb3Available && !isLoading) {
      return wagmiData;
    }
  }

  // Return safe data only if not mounted or no connection detected
  return safeData;
}

export function useBalanceSafe(config?: { address?: `0x${string}` }) {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState({
    data: undefined,
    isError: false,
    isLoading: false,
    error: null,
  } as any);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useBalance(config);

  // Return wagmi data if mounted, similar to useAccountSafe logic
  if (mounted) {
    // If Web3 is available and not loading, return wagmi data
    if (isWeb3Available && !isLoading) {
      return wagmiData;
    }
    // If wagmi data has valid balance data, return it even if Web3 context is still loading
    if (wagmiData.data !== undefined) {
      return wagmiData;
    }
  }

  // Return safe data only if not mounted or no valid data
  return safeData;
}

export function useChainIdSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState(1); // Default to mainnet

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useChainId();

  // Return wagmi data if mounted, similar to other safe hooks
  if (mounted) {
    // If Web3 is available and not loading, return wagmi data
    if (isWeb3Available && !isLoading) {
      return wagmiData;
    }
    // If wagmi data has valid chain data, return it even if Web3 context is still loading
    if (wagmiData !== undefined) {
      return wagmiData;
    }
  }

  // Return safe data only if not mounted or no valid data
  return safeData;
}

export function useConnectSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState({
    connect: () => {},
    connectors: [],
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    reset: () => {},
    status: "idle" as const,
    variables: undefined,
  } as any);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useConnect();

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}

export function useDisconnectSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useDisconnect();

  // Create a more robust fallback disconnect function
  const fallbackDisconnect = async () => {
    console.log("Using fallback disconnect method...");
    try {
      // Try multiple disconnect methods
      if (typeof window !== "undefined" && window.ethereum) {
        // Method 1: Request permissions reset
        try {
          await window.ethereum.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
          console.log("Disconnected via wallet_requestPermissions");
          return;
        } catch (permError) {
          console.log(
            "wallet_requestPermissions failed, trying other methods..."
          );
        }

        // Method 2: Direct disconnect if available
        if (
          window.ethereum.disconnect &&
          typeof window.ethereum.disconnect === "function"
        ) {
          await window.ethereum.disconnect();
          console.log("Disconnected via direct disconnect");
          return;
        }

        // Method 3: Clear accounts (for some wallets)
        try {
          await window.ethereum.request({
            method: "eth_requestAccounts",
            params: [],
          });
          console.log("Attempted account clearing");
        } catch (accountError) {
          console.log("Account clearing failed, but continuing...");
        }
      }

      console.log("Fallback disconnect completed");
    } catch (error) {
      console.error("All fallback disconnect methods failed:", error);
      throw error;
    }
  };

  const [safeData] = useState({
    disconnect: fallbackDisconnect,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    reset: () => {},
    status: "idle" as const,
    variables: undefined,
  } as any);

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}

export function useSendTransactionSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState({
    sendTransaction: () => {},
    data: undefined,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    reset: () => {},
    status: "idle" as const,
    variables: undefined,
  } as any);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useSendTransaction();

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}

/**
 * Hook to check if Web3 provider is available and mounted
 */
export function useWeb3Ready() {
  const [mounted, setMounted] = useState(false);
  const [providerReady, setProviderReady] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if provider is available by checking window object
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        setProviderReady(true);
      } else {
        setProviderReady(false);
      }
    } catch (error) {
      setProviderReady(false);
    }
  }, []);

  return mounted && providerReady;
}

export function useConnectorsSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState([] as any[]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks unconditionally to follow React rules
  const connectors = useConnectors();
  const wagmiData = [...connectors];

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}
