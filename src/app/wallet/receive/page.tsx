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

// Icons
import {
  Download,
  ArrowLeft,
  AlertTriangle,
  Copy,
  Share2,
  QrCode,
  Wallet,
  CheckCircle,
  ExternalLink,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
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

interface PaymentRequest {
  amount?: string;
  memo?: string;
  network: "ethereum" | "solana";
}

export default function ReceivePaymentPage() {
  const { session } = useSupabase();
  const router = useRouter();

  // Wallet hooks
  const { solana, ethereum } = usePhantomWallet();
  const { address: wagmiEvmAddress, isConnected: isWagmiEvmConnected } =
    useAccountSafe();

  // State
  const [selectedNetwork, setSelectedNetwork] = useState<"ethereum" | "solana">(
    "ethereum"
  );
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest>({
    amount: "",
    memo: "",
    network: "ethereum",
  });
  const [showQR, setShowQR] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Wallet connection status
  const isPhantomEvmConnected = ethereum.isConnected;
  const isPhantomSolanaConnected = solana.isConnected;
  const isEvmConnected = isPhantomEvmConnected || isWagmiEvmConnected;
  const isSolanaConnected = isPhantomSolanaConnected;
  const isAnyWalletConnected = isEvmConnected || isSolanaConnected;

  // Get wallet addresses
  const evmAddress = ethereum.address || wagmiEvmAddress;
  const solanaAddress = solana.publicKey?.toString();

  // Get current address based on selected network
  const getCurrentAddress = () => {
    if (selectedNetwork === "ethereum" && evmAddress) {
      return evmAddress;
    }
    if (selectedNetwork === "solana" && solanaAddress) {
      return solanaAddress;
    }
    return null;
  };

  const currentAddress = getCurrentAddress();

  // Copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  // Generate payment link
  const generatePaymentLink = () => {
    if (!currentAddress) return "";

    const params = new URLSearchParams();
    params.set("address", currentAddress);
    params.set("network", selectedNetwork);

    if (paymentRequest.amount) {
      params.set("amount", paymentRequest.amount);
    }
    if (paymentRequest.memo) {
      params.set("memo", paymentRequest.memo);
    }

    return `${window.location.origin}/wallet/send?${params.toString()}`;
  };

  // Share options
  const shareOptions = [
    {
      id: "copy-link",
      label: "Copy Payment Link",
      icon: Copy,
      action: () => {
        const link = generatePaymentLink();
        navigator.clipboard.writeText(link);
        toast.success("Payment link copied!");
      },
    },
    {
      id: "share-native",
      label: "Share",
      icon: Share2,
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: "Payment Request",
            text: `Send payment to my ${selectedNetwork} wallet`,
            url: generatePaymentLink(),
          });
        } else {
          const link = generatePaymentLink();
          navigator.clipboard.writeText(link);
          toast.success("Payment link copied!");
        }
      },
    },
    {
      id: "qr-code",
      label: "Show QR Code",
      icon: QrCode,
      action: () => setShowQR(true),
    },
  ];

  return (
    <StaticContentPage title="Receive Cryptocurrency Payment">
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
            <h1 className="text-3xl font-bold">Receive Payment</h1>
            <p className="text-muted-foreground">
              Share your wallet address to receive cryptocurrency payments
              securely
            </p>
          </div>
        </div>

        {/* Authentication Check */}
        {!session && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please login to access payment features.
            </AlertDescription>
          </Alert>
        )}

        {!isAnyWalletConnected && session && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to receive payments.
            </AlertDescription>
          </Alert>
        )}

        {session && isAnyWalletConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Network Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Select Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={selectedNetwork}
                    onValueChange={(value) =>
                      setSelectedNetwork(value as "ethereum" | "solana")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      {isEvmConnected && (
                        <TabsTrigger
                          value="ethereum"
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          Ethereum
                        </TabsTrigger>
                      )}
                      {isSolanaConnected && (
                        <TabsTrigger
                          value="solana"
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          Solana
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {isEvmConnected && (
                      <TabsContent value="ethereum" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Your Ethereum Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={evmAddress || ""}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                evmAddress && copyAddress(evmAddress)
                              }
                              disabled={!evmAddress}
                            >
                              {copiedAddress === evmAddress ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Share this address to receive ETH and ERC-20 tokens
                          </p>
                        </div>
                      </TabsContent>
                    )}

                    {isSolanaConnected && (
                      <TabsContent value="solana" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Your Solana Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={solanaAddress || ""}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                solanaAddress && copyAddress(solanaAddress)
                              }
                              disabled={!solanaAddress}
                            >
                              {copiedAddress === solanaAddress ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Share this address to receive SOL and SPL tokens
                          </p>
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Payment Request Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Payment Request (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Requested Amount</Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          step="0.000001"
                          placeholder="0.00"
                          value={paymentRequest.amount}
                          onChange={(e) =>
                            setPaymentRequest((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {selectedNetwork === "ethereum" ? "ETH" : "SOL"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="memo">Payment Memo</Label>
                      <Input
                        id="memo"
                        placeholder="What's this payment for?"
                        value={paymentRequest.memo}
                        onChange={(e) =>
                          setPaymentRequest((prev) => ({
                            ...prev,
                            memo: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Share Options */}
                  <div className="space-y-3">
                    <Label>Share Payment Request</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {shareOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          onClick={option.action}
                          className="flex items-center gap-2 h-auto p-4"
                          disabled={!currentAddress}
                        >
                          <option.icon className="h-4 w-4" />
                          <span className="text-sm">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Balances */}
              {isEvmConnected && <WalletBalance />}
              {isSolanaConnected && <SolanaWalletBalance />}

              {/* Network Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Network Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Selected Network:
                    </span>
                    <Badge variant="secondary">
                      {selectedNetwork === "ethereum" ? "Ethereum" : "Solana"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Address Format:
                    </span>
                    <span className="text-xs font-mono">
                      {selectedNetwork === "ethereum" ? "0x..." : "Base58"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Native Token:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedNetwork === "ethereum" ? "ETH" : "SOL"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Security Notice
                      </h4>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Only share your wallet address with trusted parties.
                        Never share your private keys or seed phrase.
                      </p>
                    </div>
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
