"use client";

import React, {
  useMemo,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import {
  SolanaNetwork,
  defaultSolanaNetwork,
  solanaNetworks,
} from "@/lib/solana-config";

interface SolanaProviderProps {
  children: React.ReactNode;
}

// Create Solana context
interface SolanaContextType {
  network: SolanaNetwork;
  setNetwork: (network: SolanaNetwork) => void;
  isSolanaAvailable: boolean;
  wallet: {
    connected: boolean;
    publicKey: any;
  };
}

const SolanaContext = createContext<SolanaContextType>({
  network: defaultSolanaNetwork,
  setNetwork: () => {},
  isSolanaAvailable: false,
  wallet: {
    connected: false,
    publicKey: null,
  },
});

export function SolanaProvider({ children }: SolanaProviderProps) {
  const [network, setNetwork] = useState<SolanaNetwork>(defaultSolanaNetwork);
  const [isSolanaAvailable, setIsSolanaAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const walletNetwork = WalletAdapterNetwork.Mainnet;

  // Use more reliable RPC endpoints from config
  const endpoint = useMemo(() => {
    // Use the configured endpoint for the current network
    const networkConfig = solanaNetworks[network];
    return networkConfig.endpoint;
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
    // Check if Solana is available
    if (typeof window !== "undefined") {
      setIsSolanaAvailable(true);
    }
  }, []);

  // Handle wallet errors gracefully
  const onError = (error: any) => {
    if (error.name === "WalletConnectionError") {
      // User rejected autoConnect - this is normal behavior
    } else if (error.name === "WalletNotReadyError") {
      // Wallet not installed during autoConnect
    } else {
      // Other errors during autoConnect
    }
  };

  const contextValue: SolanaContextType = {
    network,
    setNetwork,
    isSolanaAvailable: mounted && isSolanaAvailable,
    wallet: {
      connected: false,
      publicKey: null,
    },
  };

  return (
    <SolanaContext.Provider value={contextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect onError={onError}>
          {children}
        </WalletProvider>
      </ConnectionProvider>
    </SolanaContext.Provider>
  );
}

// Hook to use Solana context
export function useSolanaContext() {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error("useSolanaContext must be used within a SolanaProvider");
  }
  return context;
}

// Re-export wallet adapter hooks for convenience
export { useWallet, useConnection } from "@solana/wallet-adapter-react";
