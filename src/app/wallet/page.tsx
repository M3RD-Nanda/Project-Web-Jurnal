"use client";

import React from "react";
import Link from "next/link";
import { useAccountSafe } from "@/hooks/useWagmiSafe";
import { useSupabase } from "@/components/SessionProvider";
import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/wallet/WalletButton";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { WalletProfileIntegration } from "@/components/wallet/WalletProfileIntegration";
import { SolanaWalletButton } from "@/components/wallet/SolanaWalletButton";
import { SolanaWalletBalance } from "@/components/wallet/SolanaWalletBalance";
import { usePersistentWallet } from "@/hooks/usePersistentWallet";
import {
  Wallet,
  TrendingUp,
  Send,
  Download,
  History,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function WalletPage() {
  const { address, isConnected } = useAccountSafe();
  const { session, profile } = useSupabase();

  // Initialize persistent wallet functionality
  usePersistentWallet();

  return (
    <StaticContentPage title="Crypto Wallet Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3 text-foreground">
            <Wallet className="h-8 w-8 text-primary" />
            Crypto Wallet Dashboard
          </h1>
          <p className="text-muted-foreground font-semibold text-lg">
            Manage your cryptocurrency wallet and payments for journal services
          </p>
        </div>

        {/* Authentication Check */}
        {!session && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please login to access your wallet dashboard.
            </AlertDescription>
          </Alert>
        )}

        {session && (
          <>
            {/* Wallet Connection Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* EVM Wallet (Ethereum, Polygon, etc.) */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Wallet className="h-5 w-5 text-primary" />
                    EVM Wallet (ETH, MATIC, etc.)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground font-semibold">
                        Connect your EVM wallet
                      </p>
                      <WalletButton />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Connected:
                        </span>
                        <code className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-mono border border-primary/20 font-bold">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </code>
                      </div>
                      <WalletButton variant="outline" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Solana Wallet */}
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <span className="text-lg">◎</span>
                    Solana Wallet (SOL)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground font-semibold">
                      Connect your Solana wallet
                    </p>
                    <SolanaWalletButton />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* EVM Wallet Balance */}
              <WalletBalance className="order-1" />

              {/* Solana Wallet Balance */}
              <SolanaWalletBalance className="order-2" />

              {/* Profile Integration */}
              <WalletProfileIntegration className="order-3 lg:col-span-1" />
            </div>

            {/* Quick Actions */}
            {isConnected && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <Link href="/wallet/send" className="block">
                  <Card className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 h-full border border-border hover:scale-105">
                    <CardContent className="p-6 lg:p-8 text-center space-y-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <Send className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                      </div>
                      <h3 className="font-bold text-base lg:text-lg text-foreground">
                        Send Payment
                      </h3>
                      <p className="text-sm lg:text-base text-muted-foreground font-semibold">
                        Send cryptocurrency to other addresses
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/wallet/receive" className="block">
                  <Card className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 h-full border border-border hover:scale-105">
                    <CardContent className="p-6 lg:p-8 text-center space-y-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <Download className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                      </div>
                      <h3 className="font-bold text-base lg:text-lg text-foreground">
                        Receive Payment
                      </h3>
                      <p className="text-sm lg:text-base text-muted-foreground font-semibold">
                        Get your wallet address to receive payments
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Card className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-200 h-full sm:col-span-2 lg:col-span-1 border border-border hover:scale-105">
                  <CardContent className="p-6 lg:p-8 text-center space-y-4">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                      <History className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-base lg:text-lg text-foreground">
                      Transaction History
                    </h3>
                    <p className="text-sm lg:text-base text-muted-foreground font-semibold">
                      View your past transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Publication Fees Section */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Publication Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="border border-primary/20 bg-primary/5">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground font-semibold">
                    <strong className="text-primary">Coming Soon:</strong> Pay
                    publication fees directly with cryptocurrency. Supported
                    networks: Ethereum, Polygon, and more.
                  </AlertDescription>
                </Alert>

                <div className="mt-6 space-y-4">
                  <h4 className="font-bold text-foreground text-lg">
                    Supported Payment Methods:
                  </h4>
                  <ul className="text-base text-muted-foreground space-y-3 font-semibold">
                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary rounded-full border border-primary"></span>
                      Ethereum (ETH) - Main network
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary/80 rounded-full border border-primary/80"></span>
                      Polygon (MATIC) - Lower fees
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary/60 rounded-full border border-primary/60"></span>
                      USDC/USDT - Stable coins
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary/40 rounded-full border border-primary/40"></span>
                      More networks coming soon...
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert className="border border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-foreground font-semibold text-base">
                <strong className="text-destructive">Security Notice:</strong>{" "}
                Always verify transaction details before confirming. Never share
                your private keys or seed phrases. This platform only requests
                wallet connection permissions, never your private keys.
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </StaticContentPage>
  );
}
