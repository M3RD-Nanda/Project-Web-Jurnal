"use client";

import React, { useEffect, useState } from "react";
import { StaticContentPage } from "@/components/StaticContentPage";
import { useSearchParams, useRouter } from "next/navigation";
import { useSupabase } from "@/components/SessionProvider";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useAccountSafe } from "@/hooks/useWagmiSafe";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  Send,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wallet,
  Copy,
  ExternalLink,
  Shield,
  Zap,
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

interface SendFormData {
  recipientAddress: string;
  amount: string;
  memo: string;
  network: "ethereum" | "solana";
  gasPrice?: string;
}

export default function SendPaymentPage() {
  const { session } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wallet hooks
  const { solana, ethereum } = usePhantomWallet();
  const { address: wagmiEvmAddress, isConnected: isWagmiEvmConnected } =
    useAccountSafe();

  // Form state
  const [formData, setFormData] = useState<SendFormData>({
    recipientAddress: "",
    amount: "",
    memo: "",
    network: "ethereum",
    gasPrice: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<SendFormData>>({});
  const [step, setStep] = useState<"form" | "confirm" | "sending" | "success">(
    "form"
  );

  // Wallet connection status
  const isPhantomEvmConnected = ethereum.isConnected;
  const isPhantomSolanaConnected = solana.isConnected;
  const isEvmConnected = isPhantomEvmConnected || isWagmiEvmConnected;
  const isSolanaConnected = isPhantomSolanaConnected;
  const isAnyWalletConnected = isEvmConnected || isSolanaConnected;

  // Get wallet addresses
  const evmAddress = ethereum.address || wagmiEvmAddress;
  const solanaAddress = solana.publicKey?.toString();

  useEffect(() => {
    // Extract URL parameters for payment requests
    const address = searchParams.get("address") || "";
    const amount = searchParams.get("amount") || "";
    const memo = searchParams.get("memo") || "";
    const network = searchParams.get("network") || "ethereum";

    setFormData((prev) => ({
      ...prev,
      recipientAddress: address,
      amount: amount,
      memo: memo,
      network: network as "ethereum" | "solana",
    }));
  }, [searchParams]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<SendFormData> = {};

    if (!formData.recipientAddress.trim()) {
      newErrors.recipientAddress = "Recipient address is required";
    } else if (
      formData.network === "ethereum" &&
      !formData.recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)
    ) {
      newErrors.recipientAddress = "Invalid Ethereum address format";
    } else if (
      formData.network === "solana" &&
      formData.recipientAddress.length < 32
    ) {
      newErrors.recipientAddress = "Invalid Solana address format";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!isAnyWalletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setStep("confirm");
  };

  // Handle send transaction
  const handleSendTransaction = async () => {
    setStep("sending");
    setIsLoading(true);

    try {
      // Simulate transaction sending
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setStep("success");
      toast.success("Transaction sent successfully!");
    } catch (error) {
      toast.error("Failed to send transaction");
      setStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaticContentPage title="Send Cryptocurrency Payment">
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
            <h1 className="text-3xl font-bold">Send Payment</h1>
            <p className="text-muted-foreground">
              Send cryptocurrency to any wallet address securely
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
              Please connect your wallet to send payments.
            </AlertDescription>
          </Alert>
        )}

        {session && isAnyWalletConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {step === "form" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Payment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Network Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="network">Network</Label>
                        <Select
                          value={formData.network}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              network: value as "ethereum" | "solana",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {isEvmConnected && (
                              <SelectItem value="ethereum">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  Ethereum (EVM)
                                </div>
                              </SelectItem>
                            )}
                            {isSolanaConnected && (
                              <SelectItem value="solana">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                  Solana
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Recipient Address */}
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Address</Label>
                        <Input
                          id="recipient"
                          placeholder={
                            formData.network === "ethereum"
                              ? "0x..."
                              : "Enter Solana address"
                          }
                          value={formData.recipientAddress}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              recipientAddress: e.target.value,
                            }))
                          }
                          className={
                            errors.recipientAddress ? "border-red-500" : ""
                          }
                        />
                        {errors.recipientAddress && (
                          <p className="text-sm text-red-500">
                            {errors.recipientAddress}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="relative">
                          <Input
                            id="amount"
                            type="number"
                            step="0.000001"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            className={errors.amount ? "border-red-500" : ""}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {formData.network === "ethereum" ? "ETH" : "SOL"}
                          </div>
                        </div>
                        {errors.amount && (
                          <p className="text-sm text-red-500">
                            {errors.amount}
                          </p>
                        )}
                      </div>

                      {/* Memo */}
                      <div className="space-y-2">
                        <Label htmlFor="memo">Memo (Optional)</Label>
                        <Textarea
                          id="memo"
                          placeholder="Add a note for this transaction..."
                          value={formData.memo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              memo: e.target.value,
                            }))
                          }
                          rows={3}
                        />
                      </div>

                      <Separator />

                      {/* Submit Button */}
                      <Button type="submit" className="w-full" size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Review Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {step === "confirm" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Confirm Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <Badge variant="secondary">
                          {formData.network === "ethereum"
                            ? "Ethereum"
                            : "Solana"}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-mono text-sm">
                          {formData.network === "ethereum"
                            ? formatEthereumAddress(formData.recipientAddress)
                            : formatSolanaAddress(formData.recipientAddress)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">
                          {formData.amount}{" "}
                          {formData.network === "ethereum" ? "ETH" : "SOL"}
                        </span>
                      </div>

                      {formData.memo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Memo:</span>
                          <span className="text-sm">{formData.memo}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep("form")}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSendTransaction}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Send Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "sending" && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                      <h3 className="text-lg font-semibold">
                        Sending Payment...
                      </h3>
                      <p className="text-muted-foreground">
                        Please confirm the transaction in your wallet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === "success" && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                      <h3 className="text-lg font-semibold">Payment Sent!</h3>
                      <p className="text-muted-foreground">
                        Your transaction has been successfully submitted to the
                        network
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setStep("form")}
                        >
                          Send Another
                        </Button>
                        <Button onClick={() => router.push("/wallet/history")}>
                          View History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Balances */}
              {isEvmConnected && <WalletBalance />}
              {isSolanaConnected && <SolanaWalletBalance />}

              {/* Connected Wallet Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">From Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.network === "ethereum" && evmAddress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">EVM Wallet</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(evmAddress);
                            toast.success("Address copied!");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs font-mono bg-muted p-2 rounded">
                        {formatEthereumAddress(evmAddress)}
                      </div>
                    </div>
                  )}

                  {formData.network === "solana" && solanaAddress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Solana Wallet</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(solanaAddress);
                            toast.success("Address copied!");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs font-mono bg-muted p-2 rounded">
                        {formatSolanaAddress(solanaAddress)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}
