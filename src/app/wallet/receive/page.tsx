"use client";

import React from 'react';
import { StaticContentPage } from '@/components/StaticContentPage';
import { ReceivePaymentCard } from '@/components/wallet/PaymentForm';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { useSupabase } from '@/components/SessionProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function ReceivePaymentPage() {
  const { session } = useSupabase();

  return (
    <StaticContentPage title="Receive Cryptocurrency Payment">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Receive Payment</h1>
          <p className="text-muted-foreground">
            Share your wallet address to receive cryptocurrency payments
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
            {/* Receive Payment Card */}
            <ReceivePaymentCard />
            
            {/* Wallet Balance */}
            <WalletBalance />
          </div>
        )}
      </div>
    </StaticContentPage>
  );
}
