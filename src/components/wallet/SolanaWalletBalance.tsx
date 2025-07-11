"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet, useConnection } from "@/components/SolanaProvider";
import { useSolanaBalance } from "@/hooks/useSolanaSafe";
import {
  getSolanaNetworkConfig,
  formatSolBalance,
  lamportsToSol,
} from "@/lib/solana-config";
import { Wallet, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SolanaWalletBalanceProps {
  className?: string;
}

export function SolanaWalletBalance({
  className = "",
}: SolanaWalletBalanceProps) {
  const [isClient, setIsClient] = useState(false);

  const { publicKey, connected } = useWallet();
  const network = "mainnet"; // Use mainnet for real balance

  // Use the custom hook for balance fetching
  const { balance, isLoading, error, refetch } = useSolanaBalance(publicKey);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!connected || !publicKey) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey, refetch]);

  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Solana Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!connected) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Solana Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your Solana wallet to view balance
          </p>
        </CardContent>
      </Card>
    );
  }

  const networkConfig = getSolanaNetworkConfig(network);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Solana Balance
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <span className="mr-1">{networkConfig.icon}</span>
              {networkConfig.name}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : balance !== null ? (
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatSolBalance(balance)} SOL
            </div>
            <div className="text-xs text-muted-foreground">
              {balance.toLocaleString()} lamports
            </div>
            {publicKey && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const explorerUrl = `${
                    networkConfig.blockExplorer
                  }/address/${publicKey.toString()}`;
                  window.open(explorerUrl, "_blank");
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View on Explorer
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Unable to fetch balance
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar or header
export function SolanaWalletBalanceCompact() {
  const [isClient, setIsClient] = useState(false);

  const { publicKey, connected } = useWallet();

  // Use the custom hook for balance fetching
  const { balance, isLoading } = useSolanaBalance(publicKey);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !connected || !publicKey) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Wallet className="h-4 w-4" />
      {isLoading ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span>
          {balance !== null ? formatSolBalance(balance, 4) : "0.0000"} SOL
        </span>
      )}
    </div>
  );
}
