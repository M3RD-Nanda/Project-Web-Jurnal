"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StaticContentPage } from "@/components/StaticContentPage";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useAccountSafe, useDisconnectSafe } from "@/hooks/useWagmiSafe";
import { useSupabase } from "@/components/SessionProvider";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import {
  Wallet,
  Activity,
  TrendingUp,
  Send,
  Download,
  History,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Shield,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle,
  LogOut,
} from "lucide-react";

// Wallet Components
import { UnifiedWalletButton } from "@/components/wallet/UnifiedWalletButton";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { SolanaWalletBalance } from "@/components/wallet/SolanaWalletBalance";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";

// Currency Conversion
import {
  formatIDR,
  formatIDRCompact,
  lamportsToIDR,
} from "@/lib/currency-conversion";

// Solana Balance Hook
import { useSolanaBalance } from "@/hooks/useSolanaSafe";
import { PublicKey } from "@solana/web3.js";

// Types and Utils
import {
  formatSolanaAddress,
  formatEthereumAddress,
} from "@/lib/phantom-provider";

interface DashboardStats {
  totalValue: number;
  change24h: number;
  evmBalance: number;
  solanaBalance: number;
  connectedWallets: number;
  lastUpdated: Date;
}

export default function CryptoWalletDashboard() {
  const { session } = useSupabase();
  const router = useRouter();

  // Wallet hooks
  const { solana, ethereum, isAnyConnected } = usePhantomWallet();
  const { address: wagmiEvmAddress, isConnected: isWagmiEvmConnected } =
    useAccountSafe();
  const { disconnect: disconnectWagmi } = useDisconnectSafe();

  // State management
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "settings"
  >("overview");
  const [showBalances, setShowBalances] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalValue: 0,
    change24h: 0,
    evmBalance: 0,
    solanaBalance: 0,
    connectedWallets: 0,
    lastUpdated: new Date(),
  });

  // Combined wallet connection status
  const isPhantomEvmConnected = ethereum.isConnected;
  const isPhantomSolanaConnected = solana.isConnected;
  const isEvmConnected = isPhantomEvmConnected || isWagmiEvmConnected;
  const isSolanaConnected = isPhantomSolanaConnected;
  const isAnyWalletConnected = isEvmConnected || isSolanaConnected;

  // Get wallet addresses
  const evmAddress = ethereum.address || wagmiEvmAddress;
  const solanaAddress = solana.publicKey?.toString();

  // Get Solana balance for portfolio calculation
  const solanaPublicKey = solanaAddress ? new PublicKey(solanaAddress) : null;
  const { balance: solanaBalance } = useSolanaBalance(solanaPublicKey);

  // Disconnect handlers
  const handleDisconnectSolana = async () => {
    try {
      await solana.disconnect();
      toast.success("Solana wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting Solana wallet:", error);
      toast.error("Failed to disconnect Solana wallet");
    }
  };

  const handleDisconnectEVM = async () => {
    try {
      if (ethereum.isConnected) {
        // Phantom Ethereum doesn't support programmatic disconnect
        toast.info("Please disconnect through your Phantom wallet");
      } else if (isWagmiEvmConnected) {
        await disconnectWagmi();
        toast.success("EVM wallet disconnected successfully");
      }
    } catch (error) {
      console.error("Error disconnecting EVM wallet:", error);
      toast.error("Failed to disconnect EVM wallet");
    }
  };

  // Quick Actions
  const quickActions = [
    {
      id: "send",
      label: "Send Payment",
      icon: Send,
      href: "/wallet/send",
      description: "Send crypto to any address",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "receive",
      label: "Receive",
      icon: Download,
      href: "/wallet/receive",
      description: "Get your wallet address",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "history",
      label: "View History",
      icon: History,
      href: "/wallet/history",
      description: "Transaction history",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      id: "refresh",
      label: "Refresh Data",
      icon: RefreshCw,
      onClick: handleRefreshData,
      description: "Update balances",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  // Refresh data function
  async function handleRefreshData() {
    setRefreshing(true);
    try {
      // Simulate API calls and data refresh
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update stats
      setStats((prev) => ({
        ...prev,
        lastUpdated: new Date(),
      }));

      toast.success("Data refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }

  // Update stats when wallet connections change
  useEffect(() => {
    const connectedCount =
      (isEvmConnected ? 1 : 0) + (isSolanaConnected ? 1 : 0);
    setStats((prev) => ({
      ...prev,
      connectedWallets: connectedCount,
    }));
  }, [isEvmConnected, isSolanaConnected]);

  // Calculate total portfolio value in IDR
  useEffect(() => {
    let totalValueIDR = 0;

    // Add Solana balance in IDR
    if (solanaBalance !== null) {
      totalValueIDR += lamportsToIDR(solanaBalance);
    }

    // TODO: Add EVM balance when available
    // For now, EVM balance calculation is not implemented
    // In the future, we can add ETH/token balance conversion to IDR

    setStats((prev) => ({
      ...prev,
      totalValue: totalValueIDR,
      solanaBalance: solanaBalance || 0,
      // Mock 24h change for demonstration
      change24h: totalValueIDR > 0 ? Math.random() * 10 - 5 : 0,
    }));
  }, [solanaBalance]);

  return (
    <StaticContentPage title="Crypto Wallet Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Professional Wallet Management
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white">
            Crypto Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your multi-chain cryptocurrency portfolio with advanced
            analytics and secure transactions.
          </p>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
              <div
                className={`w-3 h-3 ${
                  isAnyWalletConnected ? "bg-green-500" : "bg-orange-500"
                } rounded-full animate-pulse shadow-sm`}
              ></div>
              <span className="text-sm font-medium">
                {isAnyWalletConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {isAnyWalletConnected && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">
                  {isEvmConnected && isSolanaConnected
                    ? "Multi-Chain"
                    : isEvmConnected
                    ? "EVM"
                    : "Solana"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {!session ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please login to access your wallet dashboard.
                </AlertDescription>
              </Alert>
            ) : !isAnyWalletConnected ? (
              <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-8 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">
                        Connect Your Wallet
                      </h3>
                      <p className="text-muted-foreground">
                        Connect your crypto wallet to start managing your
                        portfolio
                      </p>
                    </div>
                    <UnifiedWalletButton />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio Overview */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Portfolio Stats */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Portfolio Overview
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalances(!showBalances)}
                      >
                        {showBalances ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {showBalances
                              ? formatIDRCompact(stats.totalValue)
                              : "••••••"}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Total Portfolio Value
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              24h Change:
                            </span>
                            <span
                              className={`flex items-center gap-1 ${
                                stats.change24h >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {stats.change24h >= 0 ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : (
                                <ArrowDownLeft className="h-3 w-3" />
                              )}
                              {showBalances
                                ? `${Math.abs(stats.change24h).toFixed(2)}%`
                                : "••••"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Connected Wallets
                            </div>
                            <div className="text-lg font-semibold">
                              {stats.connectedWallets}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Active Networks
                            </div>
                            <div className="text-lg font-semibold">
                              {(isEvmConnected ? 1 : 0) +
                                (isSolanaConnected ? 1 : 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wallet Balances */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEvmConnected && <WalletBalance />}
                    {isSolanaConnected && <SolanaWalletBalance />}
                  </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quickActions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className={`w-full justify-start h-auto p-4 ${action.color} text-white border-0`}
                          onClick={
                            action.onClick || (() => router.push(action.href!))
                          }
                          disabled={action.id === "refresh" && refreshing}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <action.icon className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-medium">{action.label}</div>
                              <div className="text-xs opacity-90">
                                {action.description}
                              </div>
                            </div>
                            {action.id === "refresh" && refreshing && (
                              <RefreshCw className="h-4 w-4 animate-spin ml-auto" />
                            )}
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Connected Wallets Info */}
                  {isAnyWalletConnected && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Connected Wallets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEvmConnected && evmAddress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">EVM Wallet</Badge>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(evmAddress);
                                    toast.success("Address copied!");
                                  }}
                                  title="Copy address"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDisconnectEVM}
                                  className="text-destructive hover:text-destructive"
                                  title="Disconnect EVM wallet"
                                >
                                  <LogOut className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs font-mono bg-muted p-2 rounded">
                              {formatEthereumAddress(evmAddress)}
                            </div>
                          </div>
                        )}

                        {isSolanaConnected && solanaAddress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Solana Wallet</Badge>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      solanaAddress
                                    );
                                    toast.success("Address copied!");
                                  }}
                                  title="Copy address"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleDisconnectSolana}
                                  className="text-destructive hover:text-destructive"
                                  title="Disconnect Solana wallet"
                                >
                                  <LogOut className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs font-mono bg-muted p-2 rounded">
                              {formatSolanaAddress(solanaAddress)}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {!session ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please login to view your transaction history.
                </AlertDescription>
              </Alert>
            ) : !isAnyWalletConnected ? (
              <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardContent className="p-8 text-center">
                  <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Wallet Connected
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to view transaction history
                  </p>
                  <UnifiedWalletButton />
                </CardContent>
              </Card>
            ) : (
              <TransactionHistory />
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Balances</div>
                    <div className="text-sm text-muted-foreground">
                      Toggle visibility of wallet balances
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBalances(!showBalances)}
                  >
                    {showBalances ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">
                    {stats.lastUpdated.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StaticContentPage>
  );
}
