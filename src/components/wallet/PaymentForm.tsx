"use client";

import React, { useState, useEffect } from "react";
import {
  useAccountSafe,
  useBalanceSafe,
  useSendTransactionSafe,
  useChainIdSafe,
} from "@/hooks/useWagmiSafe";
import { usePhantomWallet } from "@/hooks/usePhantomWallet";
import { useWalletGlobalSafe } from "@/contexts/WalletGlobalContext";
import { parseEther, isAddress, formatEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBalance,
  getChainConfig,
  publicationFees,
} from "@/lib/web3-config";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Wallet,
  Settings,
  Clock,
  Users,
  BookOpen,
  Copy,
  Zap,
} from "lucide-react";

interface PaymentFormProps {
  className?: string;
  recipientAddress?: string;
  amount?: string;
  purpose?: string;
  onSuccess?: (txHash: string) => void;
}

// Address book interface
interface AddressBookEntry {
  id: string;
  name: string;
  address: string;
  category: "personal" | "business" | "exchange";
}

// Gas price options
interface GasPriceOption {
  label: string;
  value: string;
  estimatedTime: string;
  price: string;
}

export function PaymentForm({
  className,
  recipientAddress = "",
  amount = "",
  purpose = "",
  onSuccess,
}: PaymentFormProps) {
  // Use Global Wallet Context as single source of truth
  const globalWallet = useWalletGlobalSafe();

  // Fallback to individual hooks for transaction functionality
  const { address, isConnected } = useAccountSafe();
  const chainId = useChainIdSafe();

  // Use Global Context for connection status (single source of truth)
  const isWalletConnected = globalWallet.isEvmConnected;
  const walletAddress = globalWallet.evmAddress;

  // Debug logging for PaymentForm
  React.useEffect(() => {
    console.log("🔍 PaymentForm Debug (Global Context):", {
      global: {
        isEvmConnected: globalWallet.isEvmConnected,
        isSolanaConnected: globalWallet.isSolanaConnected,
        isAnyConnected: globalWallet.isAnyConnected,
        evmAddress: globalWallet.evmAddress,
        solanaAddress: globalWallet.solanaAddress,
      },
      fallback: { isConnected, address },
      unified: { isWalletConnected, walletAddress },
    });
  }, [
    globalWallet.isEvmConnected,
    globalWallet.isSolanaConnected,
    globalWallet.isAnyConnected,
    globalWallet.evmAddress,
    globalWallet.solanaAddress,
    isConnected,
    address,
    isWalletConnected,
    walletAddress,
  ]);

  const [recipient, setRecipient] = useState(recipientAddress);
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [memo, setMemo] = useState(purpose);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [selectedGasPrice, setSelectedGasPrice] = useState("standard");
  const [estimatedFee, setEstimatedFee] = useState("0");

  const { data: balance } = useBalanceSafe({
    address: walletAddress as `0x${string}` | undefined,
  });
  const { sendTransaction } = useSendTransactionSafe();
  const chainConfig = getChainConfig(chainId);
  const pubFee = publicationFees[chainId as keyof typeof publicationFees];

  // Mock address book data (in real app, this would come from local storage or database)
  const [addressBook] = useState<AddressBookEntry[]>([
    {
      id: "1",
      name: "John Doe",
      address: "0x1234567890123456789012345678901234567890",
      category: "personal",
    },
    {
      id: "2",
      name: "Exchange Wallet",
      address: "0x0987654321098765432109876543210987654321",
      category: "exchange",
    },
  ]);

  // Gas price options
  const gasPriceOptions: GasPriceOption[] = [
    { label: "Slow", value: "slow", estimatedTime: "~5 min", price: "0.001" },
    {
      label: "Standard",
      value: "standard",
      estimatedTime: "~2 min",
      price: "0.002",
    },
    { label: "Fast", value: "fast", estimatedTime: "~30 sec", price: "0.005" },
  ];

  // Calculate estimated fee based on gas price selection
  useEffect(() => {
    const selectedOption = gasPriceOptions.find(
      (option) => option.value === selectedGasPrice
    );
    if (selectedOption) {
      setEstimatedFee(selectedOption.price);
    }
  }, [selectedGasPrice]);

  const handleSendPayment = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!recipient || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address");
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Show confirmation dialog instead of sending immediately
    setShowConfirmDialog(true);
  };

  const confirmSendPayment = async () => {
    try {
      setIsLoading(true);
      setShowConfirmDialog(false);

      const txHash = await sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(paymentAmount),
      });

      toast.success("Transaction sent successfully!");

      if (onSuccess) {
        onSuccess(txHash);
      }

      // Reset form
      setRecipient("");
      setPaymentAmount("");
      setMemo("");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(`Payment failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAddressFromBook = (address: string, name: string) => {
    setRecipient(address);
    setShowAddressBook(false);
    toast.success(`Selected ${name}'s address`);
  };

  const handleQuickFillPublicationFee = () => {
    if (pubFee) {
      setPaymentAmount(pubFee.amount);
    }
  };

  if (!isWalletConnected) {
    return (
      <Card className={`${className} border border-border`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Send className="h-5 w-5 text-primary" />
            Send Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground font-semibold">
              Please connect your wallet to send payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = balance ? parseFloat(balance.formatted) : 0;
  const paymentAmountNum = parseFloat(paymentAmount) || 0;
  const hasInsufficientFunds = paymentAmountNum > currentBalance;

  return (
    <Card className={`${className} border border-border`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Send className="h-5 w-5 text-primary" />
          Send Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <Badge
            variant="secondary"
            className="gap-1 bg-primary/10 text-primary border border-primary/20"
          >
            {chainConfig?.icon} {chainConfig?.name || "Unknown"}
          </Badge>
        </div>

        {/* Current Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Available Balance
          </span>
          <div className="text-right">
            <div className="font-medium">
              {formatBalance(balance?.formatted || "0", 6)} {balance?.symbol}
            </div>
          </div>
        </div>

        <Separator />

        {/* Recipient Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddressBook(true)}
              className="text-xs gap-1"
            >
              <BookOpen className="h-3 w-3" />
              Address Book
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={
                !recipient || isAddress(recipient) ? "" : "border-destructive"
              }
            />
          </div>
          {recipient && !isAddress(recipient) && (
            <p className="text-sm text-destructive">Invalid address format</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">Amount ({balance?.symbol})</Label>
            {pubFee && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuickFillPublicationFee}
                className="text-xs"
              >
                Publication Fee: {pubFee.amount} {pubFee.token}
              </Button>
            )}
          </div>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className={hasInsufficientFunds ? "border-destructive" : ""}
          />
          {hasInsufficientFunds && (
            <p className="text-sm text-destructive">Insufficient balance</p>
          )}
        </div>

        {/* Memo Field */}
        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Textarea
            id="memo"
            placeholder="Add a note for this transaction..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="min-h-[60px] resize-none"
            maxLength={200}
          />
          <div className="text-xs text-muted-foreground text-right">
            {memo.length}/200 characters
          </div>
        </div>

        {/* Gas Price Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label>Transaction Speed</Label>
          </div>
          <Select value={selectedGasPrice} onValueChange={setSelectedGasPrice}>
            <SelectTrigger>
              <SelectValue placeholder="Select transaction speed" />
            </SelectTrigger>
            <SelectContent>
              {gasPriceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">
                        {option.estimatedTime}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {option.price} {balance?.symbol}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose (optional) */}
        {purpose && (
          <div className="space-y-2">
            <Label>Purpose</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{purpose}</p>
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        {paymentAmount && recipient && isAddress(recipient) && (
          <div className="space-y-2 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">Transaction Summary</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>
                  {paymentAmount} {balance?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Fee:</span>
                <span>
                  {estimatedFee} {balance?.symbol}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>
                  {(
                    parseFloat(paymentAmount) + parseFloat(estimatedFee)
                  ).toFixed(6)}{" "}
                  {balance?.symbol}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span>To:</span>
                <code className="text-xs">
                  {recipient.slice(0, 6)}...{recipient.slice(-4)}
                </code>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span>{chainConfig?.name}</span>
              </div>
              {memo && (
                <div className="flex justify-between">
                  <span>Memo:</span>
                  <span className="text-right max-w-[150px] truncate">
                    {memo}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendPayment}
          disabled={
            isLoading ||
            !recipient ||
            !isAddress(recipient) ||
            !paymentAmount ||
            hasInsufficientFunds ||
            paymentAmountNum <= 0
          }
          className="w-full gap-2 bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? "Sending..." : "Send Payment"}
        </Button>

        {/* Warning */}
        <Alert className="border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-xs text-foreground">
            Double-check the recipient address and amount before sending.
            Cryptocurrency transactions cannot be reversed.
          </AlertDescription>
        </Alert>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the transaction details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span className="font-medium">
                  {paymentAmount} {balance?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fee:</span>
                <span>
                  {estimatedFee} {balance?.symbol}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span>Total:</span>
                <span>
                  {(
                    parseFloat(paymentAmount || "0") + parseFloat(estimatedFee)
                  ).toFixed(6)}{" "}
                  {balance?.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>To:</span>
                <code className="text-xs">
                  {recipient.slice(0, 10)}...{recipient.slice(-8)}
                </code>
              </div>
              {memo && (
                <div className="flex justify-between text-sm">
                  <span>Memo:</span>
                  <span className="text-right max-w-[200px] truncate">
                    {memo}
                  </span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSendPayment} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirm & Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Address Book Dialog */}
      <Dialog open={showAddressBook} onOpenChange={setShowAddressBook}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Address Book</DialogTitle>
            <DialogDescription>
              Select a saved address or add a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {addressBook.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => selectAddressFromBook(entry.address, entry.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium text-sm">{entry.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.address.slice(0, 10)}...{entry.address.slice(-8)}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {entry.category}
                </Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressBook(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Component for receiving payments (showing QR code and address)
export function ReceivePaymentCard({ className }: { className?: string }) {
  // Use Global Wallet Context as single source of truth
  const globalWallet = useWalletGlobalSafe();

  // Fallback to individual hooks for chain info
  const { address, isConnected } = useAccountSafe();
  const chainId = useChainIdSafe();

  // Use Global Context for connection status (single source of truth)
  const isWalletConnected = globalWallet.isEvmConnected;
  const walletAddress = globalWallet.evmAddress;

  // Debug logging for ReceivePaymentCard
  React.useEffect(() => {
    console.log("🔍 ReceivePaymentCard Debug (Global Context):", {
      global: {
        isEvmConnected: globalWallet.isEvmConnected,
        isSolanaConnected: globalWallet.isSolanaConnected,
        isAnyConnected: globalWallet.isAnyConnected,
        evmAddress: globalWallet.evmAddress,
        solanaAddress: globalWallet.solanaAddress,
      },
      fallback: { isConnected, address },
      unified: { isWalletConnected, walletAddress },
    });
  }, [
    globalWallet.isEvmConnected,
    globalWallet.isSolanaConnected,
    globalWallet.isAnyConnected,
    globalWallet.evmAddress,
    globalWallet.solanaAddress,
    isConnected,
    address,
    isWalletConnected,
    walletAddress,
  ]);

  const [copied, setCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestMemo, setRequestMemo] = useState("");
  const [showPaymentRequest, setShowPaymentRequest] = useState(false);
  const [paymentRequestUrl, setPaymentRequestUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"simple" | "request">("simple");

  const chainConfig = getChainConfig(chainId);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generatePaymentRequest = () => {
    if (!walletAddress) return;

    const params = new URLSearchParams();
    params.set("address", walletAddress);
    if (requestAmount) params.set("amount", requestAmount);
    if (requestMemo) params.set("memo", requestMemo);
    params.set("network", chainConfig?.name || "Unknown");

    const baseUrl = window.location.origin;
    const requestUrl = `${baseUrl}/wallet/send?${params.toString()}`;
    setPaymentRequestUrl(requestUrl);
    setShowPaymentRequest(true);
  };

  const copyPaymentRequest = async () => {
    if (paymentRequestUrl) {
      await navigator.clipboard.writeText(paymentRequestUrl);
      toast.success("Payment request link copied!");
    }
  };

  if (!isWalletConnected || !walletAddress) {
    return (
      <Card className={`${className} border border-border`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Receive Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground font-semibold">
              Please connect your wallet to receive payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border border-border`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wallet className="h-5 w-5 text-primary" />
          Receive Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <Badge
            variant="secondary"
            className="gap-1 bg-primary/10 text-primary border border-primary/20"
          >
            {chainConfig?.icon} {chainConfig?.name || "Unknown"}
          </Badge>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === "simple" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("simple")}
            className="flex-1"
          >
            Simple Receive
          </Button>
          <Button
            variant={activeTab === "request" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("request")}
            className="flex-1"
          >
            Payment Request
          </Button>
        </div>

        {activeTab === "simple" ? (
          <>
            {/* Wallet Address */}
            <div className="space-y-2">
              <Label>Your Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  value={walletAddress}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="gap-1"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="space-y-2">
              <Label>QR Code</Label>
              <div className="flex justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">
                      QR Code
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scan to send payment
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Payment Request Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestAmount">
                  Requested Amount (Optional)
                </Label>
                <Input
                  id="requestAmount"
                  type="number"
                  step="0.000001"
                  placeholder="0.0"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestMemo">
                  Payment Description (Optional)
                </Label>
                <Textarea
                  id="requestMemo"
                  placeholder="What is this payment for?"
                  value={requestMemo}
                  onChange={(e) => setRequestMemo(e.target.value)}
                  className="min-h-[60px] resize-none"
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {requestMemo.length}/100 characters
                </div>
              </div>

              <Button onClick={generatePaymentRequest} className="w-full gap-2">
                <Zap className="h-4 w-4" />
                Generate Payment Request
              </Button>
            </div>

            {/* Payment Request Result */}
            {showPaymentRequest && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                <Label>Payment Request Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={paymentRequestUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPaymentRequest}
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link to request payment with pre-filled details
                </p>
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        <Alert className="border border-primary/20 bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs text-foreground">
            {activeTab === "simple"
              ? `Share your wallet address or QR code to receive payments. Make sure the sender is using the correct network (${chainConfig?.name}).`
              : "Create payment requests with specific amounts and descriptions to make it easier for others to send you payments."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default PaymentForm;
