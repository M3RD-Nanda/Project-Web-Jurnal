"use client";

import React from "react";
import {
  useAccountSafe,
  useBalanceSafe,
  useChainIdSafe,
} from "@/hooks/useWagmiSafe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBalance, getChainConfig } from "@/lib/web3-config";
import { Wallet, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletBalanceProps {
  className?: string;
}

export function WalletBalance({ className }: WalletBalanceProps) {
  const { address, isConnected } = useAccountSafe();
  const chainId = useChainIdSafe();
  const [showBalance, setShowBalance] = React.useState(true);

  const {
    data: balance,
    isLoading,
    error,
  } = useBalanceSafe({
    address,
  });

  const chainConfig = getChainConfig(chainId);

  if (!isConnected || !address) {
    return (
      <Card className={`${className} border border-border`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-4 opacity-70" />
            <p className="font-semibold text-base">
              Connect your wallet to view balance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border border-border`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p className="font-bold text-base">Error loading balance</p>
            <p className="text-sm text-destructive/80 mt-1 font-semibold">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border border-border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Balance
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            {showBalance ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">Network</span>
          <Badge
            variant="default"
            className="gap-1 bg-primary/10 text-primary border border-primary/20 font-bold"
          >
            {chainConfig?.icon} {chainConfig?.name || "Unknown"}
          </Badge>
        </div>

        {/* Balance Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Balance</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">+0.00%</span>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-12 w-48" />
          ) : (
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">
                {showBalance ? (
                  <>
                    {formatBalance(balance?.formatted || "0", 6)}{" "}
                    <span className="text-xl font-bold text-muted-foreground">
                      {balance?.symbol}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">••••••</span>
                )}
              </div>
              {showBalance && balance && (
                <div className="text-base font-semibold text-muted-foreground">
                  ≈ $0.00 USD
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address Display */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Address</span>
            <code className="text-sm bg-primary/10 text-primary px-3 py-2 rounded-lg font-mono border border-primary/20 font-bold">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar or header
export function WalletBalanceCompact() {
  const { address, isConnected } = useAccountSafe();
  const { data: balance, isLoading } = useBalanceSafe({
    address,
  });

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Wallet className="h-4 w-4" />
      {isLoading ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span>
          {formatBalance(balance?.formatted || "0", 4)} {balance?.symbol}
        </span>
      )}
    </div>
  );
}
