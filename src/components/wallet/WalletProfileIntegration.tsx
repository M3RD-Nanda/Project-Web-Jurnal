"use client";

import React, { useState, useEffect } from "react";
import { useAccountSafe, useDisconnectSafe } from "@/hooks/useWagmiSafe";
import { useSupabase } from "@/components/SessionProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "./WalletButton";
import { formatAddress } from "@/lib/web3-config";
import { toast } from "sonner";
import {
  Wallet,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface WalletProfileIntegrationProps {
  className?: string;
}

export function WalletProfileIntegration({
  className,
}: WalletProfileIntegrationProps) {
  const { address, isConnected } = useAccountSafe();
  const { disconnect } = useDisconnectSafe();
  const { supabase, session, profile } = useSupabase();
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Check if current wallet is linked to profile
  const isWalletLinked = profile?.wallet_address === address;
  const hasLinkedWallet = !!profile?.wallet_address;

  const handleLinkWallet = async () => {
    if (!session || !address) {
      toast.error("Please login and connect your wallet first");
      return;
    }

    setIsLinking(true);
    try {
      // Get authenticated user ID safely
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ wallet_address: address })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Wallet successfully linked to your profile!");
      // Refresh the page to update the profile data
      window.location.reload();
    } catch (error: any) {
      console.error("Error linking wallet:", error);
      toast.error(`Failed to link wallet: ${error.message}`);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkWallet = async () => {
    if (!session) {
      toast.error("Please login first");
      return;
    }

    setIsUnlinking(true);
    try {
      // Get authenticated user ID safely
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ wallet_address: null })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast.success("Wallet successfully unlinked from your profile!");
      // Optionally disconnect the wallet
      disconnect();
      // Refresh the page to update the profile data
      window.location.reload();
    } catch (error: any) {
      console.error("Error unlinking wallet:", error);
      toast.error(`Failed to unlink wallet: ${error.message}`);
    } finally {
      setIsUnlinking(false);
    }
  };

  if (!session) {
    return (
      <Card className={`${className} border border-border`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-foreground font-semibold">
              Please login to link your crypto wallet to your profile.
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
          Wallet Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Wallet Connection Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Current Wallet
            </span>
            {isConnected ? (
              <Badge
                variant="default"
                className="gap-1 bg-primary/10 text-primary border border-primary/20 font-bold"
              >
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 text-muted-foreground border-border font-semibold"
              >
                Not Connected
              </Badge>
            )}
          </div>

          {isConnected && address ? (
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <code className="text-sm font-mono text-primary font-bold">
                {formatAddress(address, 6)}
              </code>
              <WalletButton variant="outline" size="sm" />
            </div>
          ) : (
            <div className="flex justify-center">
              <WalletButton />
            </div>
          )}
        </div>

        {/* Profile Linked Wallet Status */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">
              Profile Linked Wallet
            </span>
            {hasLinkedWallet ? (
              <Badge
                variant="default"
                className="gap-1 bg-primary/10 text-primary border border-primary/20 font-bold"
              >
                <LinkIcon className="h-3 w-3" />
                Linked
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 text-muted-foreground border-border font-semibold"
              >
                Not Linked
              </Badge>
            )}
          </div>

          {hasLinkedWallet && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <code className="text-sm font-mono text-primary font-bold">
                {formatAddress(profile.wallet_address!, 6)}
              </code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-border">
          {isConnected && address ? (
            <>
              {!isWalletLinked && (
                <Button
                  onClick={handleLinkWallet}
                  disabled={isLinking}
                  className="w-full gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 text-base border border-primary/20 shadow-lg"
                >
                  {isLinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  {isLinking ? "Linking..." : "Link Wallet to Profile"}
                </Button>
              )}

              {isWalletLinked && (
                <Alert className="border border-primary/20 bg-primary/5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-foreground font-semibold">
                    This wallet is linked to your profile. You can now receive
                    crypto payments.
                  </AlertDescription>
                </Alert>
              )}

              {hasLinkedWallet && (
                <Button
                  onClick={handleUnlinkWallet}
                  disabled={isUnlinking}
                  variant="outline"
                  className="w-full gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 font-bold py-3 text-base"
                >
                  {isUnlinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  {isUnlinking ? "Unlinking..." : "Unlink Wallet"}
                </Button>
              )}
            </>
          ) : (
            <Alert className="border border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-foreground font-semibold">
                Connect your wallet first to link it to your profile.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Information */}
        <div className="text-sm text-muted-foreground pt-4 border-t border-border bg-muted/30 p-4 rounded-lg border">
          <p className="font-semibold leading-relaxed">
            Linking your wallet allows you to receive cryptocurrency payments
            for publication fees and other transactions directly to your
            account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
