"use client";

import React, { useState, useMemo } from "react";
import { useEvmTransactions } from "@/hooks/useEvmTransactions";
import { useSolanaTransactions } from "@/hooks/useSolanaSafe";
import { useAccountSafe } from "@/hooks/useWagmiSafe";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useWalletGlobalSafe } from "@/contexts/WalletGlobalContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export function TransactionHistory() {
  const [activeTab, setActiveTab] = useState<"evm" | "solana">("evm");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);

  // Use Global Wallet Context as single source of truth
  const globalWallet = useWalletGlobalSafe();

  // Fallback to individual hooks for transaction functionality
  const { address: evmAddress, isConnected: isEvmConnected } = useAccountSafe();

  // Use Global Context for connection status (single source of truth)
  const isEvmWalletConnected = globalWallet.isEvmConnected;
  const finalEvmAddress = globalWallet.evmAddress;

  const {
    transactions: evmTransactions,
    isLoading: isEvmLoading,
    error: evmError,
    refetch: refetchEvmTransactions,
  } = useEvmTransactions();

  // Solana wallet state (fallback for transaction functionality)
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } =
    useWallet();

  // Use Global Context for Solana connection status (single source of truth)
  const isSolanaWalletConnected = globalWallet.isSolanaConnected;
  const finalSolanaPublicKey = globalWallet.solanaAddress;

  // Debug logging for TransactionHistory
  React.useEffect(() => {
    console.log("🔍 TransactionHistory Debug (Global Context):", {
      global: {
        isEvmConnected: globalWallet.isEvmConnected,
        isSolanaConnected: globalWallet.isSolanaConnected,
        isAnyConnected: globalWallet.isAnyConnected,
        evmAddress: globalWallet.evmAddress,
        solanaAddress: globalWallet.solanaAddress,
      },
      fallback: {
        wagmi: { isEvmConnected, evmAddress },
        solanaAdapter: { isSolanaConnected, solanaPublicKey },
      },
      unified: {
        isEvmWalletConnected,
        finalEvmAddress,
        isSolanaWalletConnected,
        finalSolanaPublicKey,
      },
    });
  }, [
    globalWallet.isEvmConnected,
    globalWallet.isSolanaConnected,
    globalWallet.isAnyConnected,
    globalWallet.evmAddress,
    globalWallet.solanaAddress,
    isEvmConnected,
    evmAddress,
    isSolanaConnected,
    solanaPublicKey,
    isEvmWalletConnected,
    finalEvmAddress,
    isSolanaWalletConnected,
    finalSolanaPublicKey,
  ]);

  const {
    transactions: solanaTransactions,
    isLoading: isSolanaLoading,
    error: solanaError,
    refetch: refetchSolanaTransactions,
  } = useSolanaTransactions(finalSolanaPublicKey);

  // Handle refresh for the active tab
  const handleRefresh = () => {
    if (activeTab === "evm") {
      refetchEvmTransactions();
    } else {
      refetchSolanaTransactions();
    }
  };

  // Format transaction time
  const formatTransactionTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  };

  // Filter transactions based on search and filters
  const filteredEvmTransactions = useMemo(() => {
    let filtered = evmTransactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.to.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    // Type filter (sent/received)
    if (typeFilter !== "all") {
      if (typeFilter === "sent") {
        filtered = filtered.filter(
          (tx) => tx.from.toLowerCase() === evmAddress?.toLowerCase()
        );
      } else if (typeFilter === "received") {
        filtered = filtered.filter(
          (tx) => tx.to.toLowerCase() === evmAddress?.toLowerCase()
        );
      }
    }

    return filtered;
  }, [evmTransactions, searchQuery, statusFilter, typeFilter, evmAddress]);

  const filteredSolanaTransactions = useMemo(() => {
    let filtered = solanaTransactions;

    // Search filter for Solana
    if (searchQuery) {
      filtered = filtered.filter((tx) =>
        tx.signature.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter for Solana
    if (statusFilter !== "all") {
      if (statusFilter === "success") {
        filtered = filtered.filter((tx) => !tx.err);
      } else if (statusFilter === "failed") {
        filtered = filtered.filter((tx) => tx.err);
      }
    }

    return filtered;
  }, [solanaTransactions, searchQuery, statusFilter]);

  // Export transactions to CSV
  const exportTransactions = () => {
    const transactions =
      activeTab === "evm"
        ? filteredEvmTransactions
        : filteredSolanaTransactions;

    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    let csvContent = "";

    if (activeTab === "evm") {
      csvContent = "Date,Hash,From,To,Amount,Status\n";
      transactions.forEach((tx) => {
        const date = format(
          new Date(tx.timestamp * 1000),
          "yyyy-MM-dd HH:mm:ss"
        );
        csvContent += `${date},${tx.hash},${tx.from},${tx.to},${tx.formattedValue},${tx.status}\n`;
      });
    } else {
      csvContent = "Date,Signature,Status\n";
      transactions.forEach((tx) => {
        const date = format(
          new Date(tx.blockTime * 1000),
          "yyyy-MM-dd HH:mm:ss"
        );
        csvContent += `${date},${tx.signature},${
          tx.err ? "Failed" : "Success"
        }\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${activeTab}_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View transaction details
  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View and manage your transaction history
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportTransactions}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={
                (activeTab === "evm" && isEvmLoading) ||
                (activeTab === "solana" && isSolanaLoading)
              }
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  (activeTab === "evm" && isEvmLoading) ||
                  (activeTab === "solana" && isSolanaLoading)
                    ? "animate-spin"
                    : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by hash, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === "evm" && (
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="evm"
          onValueChange={(value) => setActiveTab(value as "evm" | "solana")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="evm" disabled={!isEvmWalletConnected}>
              EVM
            </TabsTrigger>
            <TabsTrigger value="solana" disabled={!isSolanaWalletConnected}>
              Solana
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evm">
            {!isEvmWalletConnected ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Connect your EVM wallet to view transactions
                </p>
              </div>
            ) : evmError ? (
              <div className="text-center py-6">
                <p className="text-red-500">
                  Error loading transactions: {evmError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={refetchEvmTransactions}
                >
                  Try Again
                </Button>
              </div>
            ) : isEvmLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : evmTransactions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : filteredEvmTransactions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "No transactions match your filters"
                    : "No transactions found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvmTransactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {tx.from.toLowerCase() === evmAddress?.toLowerCase() ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium">
                          {tx.from.toLowerCase() === evmAddress?.toLowerCase()
                            ? "Sent"
                            : "Received"}
                        </span>
                        <Badge
                          variant={
                            tx.status === "success"
                              ? "outline"
                              : tx.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTransactionTime(tx.timestamp)} •
                        <span className="font-mono ml-1">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            tx.from.toLowerCase() === evmAddress?.toLowerCase()
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {tx.from.toLowerCase() === evmAddress?.toLowerCase()
                            ? "-"
                            : "+"}
                          {tx.formattedValue}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewTransactionDetails(tx)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solana">
            {!isSolanaWalletConnected ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Connect your Solana wallet to view transactions
                </p>
              </div>
            ) : solanaError ? (
              <div className="text-center py-6">
                <p className="text-red-500">
                  Error loading transactions: {solanaError}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={refetchSolanaTransactions}
                >
                  Try Again
                </Button>
              </div>
            ) : isSolanaLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : solanaTransactions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {solanaTransactions.map((tx) => (
                  <div
                    key={tx.signature}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Transaction</span>
                        <Badge variant={tx.err ? "destructive" : "outline"}>
                          {tx.err ? "Failed" : "Success"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTransactionTime(tx.blockTime)} •
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-primary"
                        >
                          View
                        </a>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Slot: {tx.slot}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Transaction Details Dialog */}
      <Dialog
        open={showTransactionDetails}
        onOpenChange={setShowTransactionDetails}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Status</div>
                  <Badge
                    variant={
                      selectedTransaction.status === "success" ||
                      !selectedTransaction.err
                        ? "outline"
                        : selectedTransaction.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {selectedTransaction.status ||
                      (selectedTransaction.err ? "Failed" : "Success")}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">
                    {format(
                      new Date(
                        (selectedTransaction.timestamp ||
                          selectedTransaction.blockTime) * 1000
                      ),
                      "MMM dd, yyyy HH:mm:ss"
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {selectedTransaction.hash ? (
                // EVM Transaction Details
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Transaction Hash</div>
                    <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedTransaction.hash}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">From</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {selectedTransaction.from}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">To</div>
                      <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                        {selectedTransaction.to}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Amount</div>
                    <div className="text-lg font-semibold">
                      {selectedTransaction.formattedValue}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Gas Used</div>
                      <div className="text-sm">
                        {selectedTransaction.gasUsed || "N/A"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Gas Price</div>
                      <div className="text-sm">
                        {selectedTransaction.gasPrice || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://etherscan.io/tx/${selectedTransaction.hash}`,
                          "_blank"
                        )
                      }
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View on Etherscan
                    </Button>
                  </div>
                </>
              ) : (
                // Solana Transaction Details
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Signature</div>
                    <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {selectedTransaction.signature}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Slot</div>
                      <div className="text-sm">{selectedTransaction.slot}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Confirmations</div>
                      <div className="text-sm">
                        {selectedTransaction.confirmationStatus || "Confirmed"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://explorer.solana.com/tx/${selectedTransaction.signature}`,
                          "_blank"
                        )
                      }
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View on Solana Explorer
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
