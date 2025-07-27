"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  useWallet,
  useConnection,
  useSolanaContext,
} from "@/components/SolanaProvider";
import {
  fetchBalanceWithFallback,
  clearBalanceCache,
} from "@/lib/solana-connection";

// Safe wrapper for Solana wallet
export function useWalletSafe() {
  const [mounted, setMounted] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return wallet from context if available and mounted
  if (mounted) {
    return wallet;
  }

  // Safe fallback with all necessary properties
  return {
    connected: false,
    connecting: false,
    publicKey: null,
    wallet: null,
    wallets: [],
    select: () => {},
    connect: async () => {},
    disconnect: async () => {},
    sendTransaction: async () => "mock-signature",
  };
}

// Safe wrapper for Solana connection
export function useConnectionSafe() {
  const [mounted, setMounted] = useState(false);
  const { connection } = useConnection();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return connection if available and mounted
  if (mounted && connection) {
    return { connection };
  }

  // Safe fallback
  return {
    connection: null,
  };
}

// Custom hook for Solana balance
export function useSolanaBalance(publicKey?: any) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { network } = useSolanaContext();

  // Create a stable fetchBalance function that doesn't change on every render
  const fetchBalance = useCallback(
    async (forceRefresh = false) => {
      if (!publicKey) {
        setBalance(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Clear cache if this is a forced refresh
        if (forceRefresh) {
          clearBalanceCache(publicKey, network);
        }

        // Use the enhanced balance fetching with fallback and retry
        const balanceInLamports = await fetchBalanceWithFallback(
          publicKey,
          network
        );
        setBalance(balanceInLamports);
      } catch (err: any) {
        // Reduce console spam - only log in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching Solana balance:", err);
        }

        // Handle specific error types with user-friendly messages
        if (
          err.message?.includes("403") ||
          err.message?.includes("Access forbidden")
        ) {
          setError(
            "RPC endpoint access forbidden. Please check your API configuration."
          );
        } else if (
          err.message?.includes("429") ||
          err.message?.includes("Too Many Requests") ||
          err.message?.includes("rate limit") ||
          err.message?.includes("Exceeded rate limit") ||
          err.message?.includes("Rate limit exceeded")
        ) {
          setError("Rate limit exceeded. Please wait a moment and try again.");
        } else if (err.message?.includes("Failed to connect")) {
          setError(
            "Unable to connect to Solana network. Please check your internet connection."
          );
        } else {
          setError("Failed to fetch balance. Please try again later.");
        }

        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    },
    [publicKey, network]
  );

  useEffect(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (publicKey) {
      // Debounce the balance fetch to prevent rapid calls
      debounceTimerRef.current = setTimeout(() => {
        fetchBalance();
      }, 500); // 500ms debounce
    } else {
      setBalance(null);
    }

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [publicKey, network]); // Removed fetchBalance from dependencies to prevent infinite loop

  // Enhanced refetch function that clears cache
  const refetch = useCallback(() => {
    if (publicKey) {
      // Clear any existing timer first
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Call fetchBalance with forceRefresh to clear cache and get fresh data
      fetchBalance(true);
    }
  }, [publicKey, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch,
  };
}

// Custom hook for sending SOL
export function useSendSol() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wallet = useWalletSafe();
  const { connection } = useConnectionSafe();

  const sendSol = async (toAddress: string, amount: number) => {
    if (!wallet.publicKey || !connection || !wallet.sendTransaction) {
      throw new Error("Wallet not connected or connection not available");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Placeholder implementation - will be replaced with real Solana transaction

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockSignature = "mock-transaction-signature-" + Date.now();

      return mockSignature;
    } catch (err: any) {
      console.error("Error sending SOL:", err);
      setError(err.message || "Failed to send SOL");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendSol,
    isLoading,
    error,
  };
}

// Custom hook for Solana transaction history
export function useSolanaTransactions(publicKey?: any, limit = 10) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connection } = useConnectionSafe();
  const { isSolanaAvailable } = useSolanaContext();

  const fetchTransactions = async () => {
    if (!publicKey || !connection || !isSolanaAvailable) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock transaction data
      const mockTransactions = [
        {
          signature: "mock-signature-1",
          slot: 123456,
          blockTime: Date.now() / 1000 - 3600, // 1 hour ago
          transaction: null,
          err: null,
        },
        {
          signature: "mock-signature-2",
          slot: 123455,
          blockTime: Date.now() / 1000 - 7200, // 2 hours ago
          transaction: null,
          err: null,
        },
      ];

      setTransactions(mockTransactions);
    } catch (err: any) {
      console.error("Error fetching Solana transactions:", err);
      setError(err.message || "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey && connection && isSolanaAvailable) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [publicKey, connection, isSolanaAvailable]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
