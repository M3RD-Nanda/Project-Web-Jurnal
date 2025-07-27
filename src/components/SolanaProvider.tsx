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
  useWallet,
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

// Inner component that has access to wallet context
function SolanaContextProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<SolanaNetwork>(defaultSolanaNetwork);
  const [isSolanaAvailable, setIsSolanaAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Get actual wallet status from wallet adapter
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    setMounted(true);
    // Check if Solana is available
    if (typeof window !== "undefined") {
      setIsSolanaAvailable(true);
    }
  }, []);

  const contextValue: SolanaContextType = {
    network,
    setNetwork,
    isSolanaAvailable: mounted && isSolanaAvailable,
    wallet: {
      connected,
      publicKey,
    },
  };

  return (
    <SolanaContext.Provider value={contextValue}>
      {children}
    </SolanaContext.Provider>
  );
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  const [network, setNetwork] = useState<SolanaNetwork>(defaultSolanaNetwork);

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
      // Note: Phantom is handled by custom integration to avoid conflicts
      // new PhantomWalletAdapter(), // Commented out to prevent Standard Wallet conflicts
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

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

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false} onError={onError}>
        <SolanaContextProvider>{children}</SolanaContextProvider>
      </WalletProvider>
    </ConnectionProvider>
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
