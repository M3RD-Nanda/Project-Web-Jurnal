"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
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

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useAccount();
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
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

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useBalance(config);
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}

export function useChainIdSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState(1); // Default to mainnet

  useEffect(() => {
    setMounted(true);
  }, []);

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useChainId();
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
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

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useConnect();
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

  // Only return wagmi data if Web3 is available and mounted
  return mounted && isWeb3Available && !isLoading ? wagmiData : safeData;
}

export function useDisconnectSafe() {
  const [mounted, setMounted] = useState(false);
  const { isWeb3Available, isLoading } = useWeb3Context();

  const [safeData] = useState({
    disconnect: () => {},
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

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useDisconnect();
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

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

  // Try to call Wagmi hook, but handle errors gracefully
  let wagmiData = safeData;
  try {
    wagmiData = useSendTransaction();
  } catch (error) {
    // WagmiProvider not available, use safe data
    wagmiData = safeData;
  }

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

    // Check if provider is available
    try {
      useAccount();
      setProviderReady(true);
    } catch (error) {
      setProviderReady(false);
    }
  }, []);

  return mounted && providerReady;
}