"use client";

import React from "react";
import { Web3Provider } from "@/components/Web3Provider";
import { SolanaProvider } from "@/components/SolanaProvider";

interface WalletLayoutProps {
  children: React.ReactNode;
}

export default function WalletLayout({ children }: WalletLayoutProps) {
  return (
    <Web3Provider>
      <SolanaProvider>
        {children}
      </SolanaProvider>
    </Web3Provider>
  );
}
