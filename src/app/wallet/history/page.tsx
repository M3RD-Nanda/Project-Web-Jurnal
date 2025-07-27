"use client";

import React, { useState, useEffect } from "react";
import { StaticContentPage } from "@/components/StaticContentPage";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useAccountSafe } from "@/hooks/useWagmiSafe";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import {
  History,
  ArrowLeft,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

// Dynamic imports for wallet components
import dynamic from "next/dynamic";

const WalletBalance = dynamic(
  () =>
    import("@/components/wallet/WalletBalance").then((mod) => ({
      default: mod.WalletBalance,
    })),
  {
    loading: () => <div className="h-20 bg-gray-200 animate-pulse rounded" />,
    ssr: false,
  }
);

const SolanaWalletBalance = dynamic(
  () =>
    import("@/components/wallet/SolanaWalletBalance").then((mod) => ({
      default: mod.SolanaWalletBalance,
    })),
  {
    loading: () => <div className="h-20 bg-gray-200 animate-pulse rounded" />,
    ssr: false,
  }
);

// Utils
import {
  formatEthereumAddress,
  formatSolanaAddress,
} from "@/lib/phantom-provider";
import { toast } from "sonner";

// Mock transaction data
interface Transaction {
  id: string;
  hash: string;
  type: "send" | "receive";
  network: "ethereum" | "solana";
  amount: number;
  token: string;
  from: string;
  to: string;
  status: "confirmed" | "pending" | "failed";
  timestamp: Date;
  fee?: number;
  memo?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    hash: "0x1234567890abcdef1234567890abcdef12345678",
    type: "send",
    network: "ethereum",
    amount: 0.5,
    token: "ETH",
    from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    to: "0x8ba1f109551bD432803012645Hac136c22C177e9",
    status: "confirmed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    fee: 0.002,
    memo: "Payment for services",
  },
  {
    id: "2",
    hash: "5KJp7z2H8gTqVhLEHJp7z2H8gTqVhLE",
    type: "receive",
    network: "solana",
    amount: 2.5,
    token: "SOL",
    from: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    to: "FNnt6cDVyGqNNH7v3zqNNH7v3zqNNH7v3zqNNH7v3zq",
    status: "confirmed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    fee: 0.00025,
  },
  {
    id: "3",
    hash: "0xabcdef1234567890abcdef1234567890abcdef12",
    type: "send",
    network: "ethereum",
    amount: 1.2,
    token: "ETH",
    from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    to: "0x9ba1f109551bD432803012645Hac136c22C177e9",
    status: "pending",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    fee: 0.003,
  },
];

export default function TransactionHistoryPage() {
  const { session } = useSupabase();
  const router = useRouter();

  // Wallet hooks
  const { solana, ethereum } = usePhantomWallet();
  const { address: wagmiEvmAddress, isConnected: isWagmiEvmConnected } =
    useAccountSafe();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNetwork, setFilterNetwork] = useState<
    "all" | "ethereum" | "solana"
  >("all");
  const [filterType, setFilterType] = useState<"all" | "send" | "receive">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "pending" | "failed"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions);

  // Wallet connection status
  const isPhantomEvmConnected = ethereum.isConnected;
  const isPhantomSolanaConnected = solana.isConnected;
  const isEvmConnected = isPhantomEvmConnected || isWagmiEvmConnected;
  const isSolanaConnected = isPhantomSolanaConnected;
  const isAnyWalletConnected = isEvmConnected || isSolanaConnected;

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      searchTerm === "" ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.memo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNetwork =
      filterNetwork === "all" || tx.network === filterNetwork;
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    return matchesSearch && matchesNetwork && matchesType && matchesStatus;
  });

  // Refresh transactions
  const refreshTransactions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Transaction history refreshed!");
    } catch (error) {
      toast.error("Failed to refresh transactions");
    } finally {
      setIsLoading(false);
    }
  };

  // Get transaction status icon
  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get transaction type icon
  const getTypeIcon = (type: Transaction["type"]) => {
    return type === "send" ? (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    ) : (
      <ArrowDownLeft className="h-4 w-4 text-green-500" />
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <StaticContentPage title="Transaction History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">
              View and manage your cryptocurrency transaction history
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshTransactions}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Authentication Check */}
        {!session && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please login to view your transaction history.
            </AlertDescription>
          </Alert>
        )}

        {!isAnyWalletConnected && session && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to view transaction history.
            </AlertDescription>
          </Alert>
        )}

        {session && isAnyWalletConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Transactions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by hash, address, or memo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <Select
                        value={filterNetwork}
                        onValueChange={(value) =>
                          setFilterNetwork(value as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Networks</SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="solana">Solana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={filterType}
                        onValueChange={(value) => setFilterType(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="send">Sent</SelectItem>
                          <SelectItem value="receive">Received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filterStatus}
                        onValueChange={(value) => setFilterStatus(value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Transactions ({filteredTransactions.length})
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Transactions Found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm ||
                        filterNetwork !== "all" ||
                        filterType !== "all" ||
                        filterStatus !== "all"
                          ? "Try adjusting your filters or search terms"
                          : "Your transaction history will appear here once you start using your wallet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {/* Type & Status Icons */}
                          <div className="flex items-center gap-2">
                            {getTypeIcon(tx.type)}
                            {getStatusIcon(tx.status)}
                          </div>

                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">
                                {tx.type}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {tx.network}
                              </Badge>
                              <Badge
                                variant={
                                  tx.status === "confirmed"
                                    ? "default"
                                    : tx.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {tx.status}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-2 mb-1">
                                <span>
                                  {tx.type === "send" ? "To:" : "From:"}{" "}
                                  {tx.network === "ethereum"
                                    ? formatEthereumAddress(
                                        tx.type === "send" ? tx.to : tx.from
                                      )
                                    : formatSolanaAddress(
                                        tx.type === "send" ? tx.to : tx.from
                                      )}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <span>{formatTimestamp(tx.timestamp)}</span>
                                {tx.memo && <span>• {tx.memo}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <div
                              className={`font-semibold ${
                                tx.type === "send"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {tx.type === "send" ? "-" : "+"}
                              {tx.amount} {tx.token}
                            </div>
                            {tx.fee && (
                              <div className="text-xs text-muted-foreground">
                                Fee: {tx.fee} {tx.token}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Open transaction in explorer
                              const explorerUrl =
                                tx.network === "ethereum"
                                  ? `https://etherscan.io/tx/${tx.hash}`
                                  : `https://solscan.io/tx/${tx.hash}`;
                              window.open(explorerUrl, "_blank");
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Balances */}
              {isEvmConnected && <WalletBalance />}
              {isSolanaConnected && <SolanaWalletBalance />}

              {/* Transaction Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Transactions:
                    </span>
                    <span className="font-medium">{transactions.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent:</span>
                    <span className="font-medium text-red-600">
                      {transactions.filter((tx) => tx.type === "send").length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Received:
                    </span>
                    <span className="font-medium text-green-600">
                      {
                        transactions.filter((tx) => tx.type === "receive")
                          .length
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Pending:
                    </span>
                    <span className="font-medium text-yellow-600">
                      {
                        transactions.filter((tx) => tx.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}
