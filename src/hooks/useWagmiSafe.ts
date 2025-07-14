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

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useBalance(config);

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

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useChainId();

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

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useConnect();

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

  // Always call hooks unconditionally to follow React rules
  const wagmiData = useDisconnect();

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
