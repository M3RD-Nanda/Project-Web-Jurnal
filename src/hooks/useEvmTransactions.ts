"use client";

import { useState, useEffect } from "react";
import { useAccountSafe, useChainIdSafe } from "./useWagmiSafe";
import { formatEther } from "viem";

// Interface for transaction data
export interface EvmTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  formattedValue: string;
  timestamp: number;
  blockNumber: number;
  status: "success" | "pending" | "failed";
}

/**
 * Hook to fetch EVM transaction history
 * Currently returns mock data, but can be extended to use real blockchain data
 */
export function useEvmTransactions(limit = 10) {
  const { address } = useAccountSafe();
  const chainId = useChainIdSafe();
  const [transactions, setTransactions] = useState<EvmTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address || !chainId) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call an API or blockchain provider
      // For now, we'll use mock data
      const mockTransactions: EvmTransaction[] = [
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          from: address,
          to: "0x1234567890123456789012345678901234567890",
          value: "100000000000000000", // 0.1 ETH in wei
          formattedValue: "0.1 ETH",
          timestamp: Date.now() / 1000 - 3600, // 1 hour ago
          blockNumber: 12345678,
          status: "success",
        },
        {
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          from: "0x0987654321098765432109876543210987654321",
          to: address,
          value: "500000000000000000", // 0.5 ETH in wei
          formattedValue: "0.5 ETH",
          timestamp: Date.now() / 1000 - 7200, // 2 hours ago
          blockNumber: 12345677,
          status: "success",
        },
        {
          hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
          from: address,
          to: "0x2468135790246813579024681357902468135790",
          value: "50000000000000000", // 0.05 ETH in wei
          formattedValue: "0.05 ETH",
          timestamp: Date.now() / 1000 - 10800, // 3 hours ago
          blockNumber: 12345676,
          status: "success",
        },
      ];

      // Limit the number of transactions returned
      setTransactions(mockTransactions.slice(0, limit));
    } catch (err: any) {
      console.error("Error fetching EVM transactions:", err);
      setError(err.message || "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address && chainId) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [address, chainId, limit]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}