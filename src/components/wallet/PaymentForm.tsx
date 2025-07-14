"use client";

import React, { useState } from "react";
import {
  useAccountSafe,
  useBalanceSafe,
  useSendTransactionSafe,
  useChainIdSafe,
} from "@/hooks/useWagmiSafe";
import { parseEther, isAddress } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

interface PaymentFormProps {
  className?: string;
  recipientAddress?: string;
  amount?: string;
  purpose?: string;
  onSuccess?: (txHash: string) => void;
}

export function PaymentForm({
  className,
  recipientAddress = "",
  amount = "",
  purpose = "",
  onSuccess,
}: PaymentFormProps) {
  const { address, isConnected } = useAccountSafe();
  const chainId = useChainIdSafe();
  const [recipient, setRecipient] = useState(recipientAddress);
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [isLoading, setIsLoading] = useState(false);

  const { data: balance } = useBalanceSafe({ address });
  const { sendTransaction } = useSendTransactionSafe();
  const chainConfig = getChainConfig(chainId);
  const pubFee = publicationFees[chainId as keyof typeof publicationFees];

  const handleSendPayment = async () => {
    if (!isConnected || !address) {
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

    try {
      setIsLoading(true);

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
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(`Payment failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillPublicationFee = () => {
    if (pubFee) {
      setPaymentAmount(pubFee.amount);
    }
  };

  if (!isConnected) {
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
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className={
              !recipient || isAddress(recipient) ? "" : "border-destructive"
            }
          />
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
                <span>To:</span>
                <code className="text-xs">
                  {recipient.slice(0, 6)}...{recipient.slice(-4)}
                </code>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span>{chainConfig?.name}</span>
              </div>
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
    </Card>
  );
}

// Component for receiving payments (showing QR code and address)
export function ReceivePaymentCard({ className }: { className?: string }) {
  const { address, isConnected } = useAccountSafe();
  const chainId = useChainIdSafe();
  const [copied, setCopied] = useState(false);

  const chainConfig = getChainConfig(chainId);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected || !address) {
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

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label>Your Wallet Address</Label>
          <div className="flex gap-2">
            <Input value={address} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="gap-1"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <DollarSign className="h-4 w-4" />
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
                <span className="text-muted-foreground text-sm">QR Code</span>
              </div>
              <p className="text-xs text-muted-foreground">
                QR code generation coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Alert className="border border-primary/20 bg-primary/5">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs text-foreground">
            Share your wallet address or QR code to receive payments. Make sure
            the sender is using the correct network ({chainConfig?.name}).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default PaymentForm;
