"use client";

import React from "react";
import { StaticContentPage } from "@/components/StaticContentPage";
import dynamic from "next/dynamic";

// Dynamic imports for wallet components
const PaymentForm = dynamic(
  () =>
    import("@/components/wallet/PaymentForm").then((mod) => ({
      default: mod.PaymentForm,
    })),
  {
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded" />,
    ssr: false,
  }
);

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
import { useSupabase } from "@/components/SessionProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function SendPaymentPage() {
  const { session } = useSupabase();

  return (
    <StaticContentPage title="Send Cryptocurrency Payment">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Send Payment</h1>
          <p className="text-muted-foreground">
            Send cryptocurrency to any wallet address
          </p>
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

        {session && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Form */}
            <PaymentForm />

            {/* Wallet Balance */}
            <WalletBalance />
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}
