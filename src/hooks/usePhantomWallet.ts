"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPhantomSolanaProvider,
  getPhantomEthereumProvider,
  connectPhantomSolana,
  connectPhantomEthereum,
  disconnectPhantomSolana,
  getSolanaConnectionStatus,
  getEthereumConnectionStatus,
  type PhantomSolanaProvider,
  type PhantomEthereumProvider,
} from "@/lib/phantom-provider";

// Solana Wallet Hook
export const usePhantomSolana = () => {
  const [provider, setProvider] = useState<PhantomSolanaProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize provider and auto-connect
  useEffect(() => {
    const phantomProvider = getPhantomSolanaProvider();
    setProvider(phantomProvider);

    if (phantomProvider) {
      // Check initial connection status
      const status = getSolanaConnectionStatus();
      setIsConnected(status.isConnected);
      setPublicKey(status.publicKey);

      // Check if user manually disconnected before attempting auto-connect
      const manuallyDisconnected =
        localStorage.getItem("phantom_solana_manually_disconnected") === "true";

      // Auto-connect if previously connected (silent reconnection) and not manually disconnected
      if (!status.isConnected && !manuallyDisconnected) {
        phantomProvider
          .connect({ onlyIfTrusted: true })
          .then((response) => {
            console.log(
              "🔄 Auto-connected to Phantom Solana:",
              response.publicKey.toString()
            );
            setIsConnected(true);
            setPublicKey(response.publicKey.toString());
          })
          .catch((error) => {
            // Silent fail for auto-connect - user needs to manually connect
            console.log(
              "ℹ️ Auto-connect not available, manual connection required"
            );
          });
      }
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!provider) return;

    const handleConnect = (publicKey: any) => {
      setIsConnected(true);
      setPublicKey(publicKey.toString());
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      console.log("🔌 Phantom Solana disconnect event received");
      setIsConnected(false);
      setPublicKey(null);
      setIsConnecting(false);
      console.log("✅ Solana state reset after disconnect event");
    };

    const handleAccountChanged = (publicKey: any) => {
      if (publicKey) {
        setPublicKey(publicKey.toString());
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setPublicKey(null);
      }
    };

    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);
    provider.on("accountChanged", handleAccountChanged);

    return () => {
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
      provider.off("accountChanged", handleAccountChanged);
    };
  }, [provider]);

  const connect = useCallback(
    async (onlyIfTrusted: boolean = false) => {
      if (!provider) {
        throw new Error("Phantom not installed");
      }

      setIsConnecting(true);
      try {
        const response = await connectPhantomSolana(onlyIfTrusted);
        if (response) {
          // Clear manual disconnect flag when user manually connects
          localStorage.removeItem("phantom_solana_manually_disconnected");
          setIsConnected(true);
          setPublicKey(response.publicKey.toString());

          // Dispatch immediate balance update event
          window.dispatchEvent(
            new CustomEvent("walletBalanceUpdateNeeded", {
              detail: { walletType: "solana", immediate: true },
            })
          );
        }
        return response;
      } catch (error) {
        setIsConnecting(false);
        throw error;
      }
    },
    [provider]
  );

  const disconnect = useCallback(async () => {
    if (!provider) return;

    try {
      console.log("🔌 Disconnecting Phantom Solana...");

      // Set manual disconnect flag to prevent auto-reconnection
      localStorage.setItem("phantom_solana_manually_disconnected", "true");

      await disconnectPhantomSolana();

      // Force state reset immediately
      setIsConnected(false);
      setPublicKey(null);
      setIsConnecting(false);

      console.log("✅ Phantom Solana disconnected and state reset");
    } catch (error) {
      console.error("❌ Failed to disconnect:", error);
      // Even if disconnect fails, reset local state and set manual disconnect flag
      localStorage.setItem("phantom_solana_manually_disconnected", "true");
      setIsConnected(false);
      setPublicKey(null);
      setIsConnecting(false);
      throw error;
    }
  }, [provider]);

  return {
    provider,
    isConnected,
    publicKey,
    isConnecting,
    connect,
    disconnect,
    isInstalled: !!provider,
  };
};

// Ethereum Wallet Hook
export const usePhantomEthereum = () => {
  const [provider, setProvider] = useState<PhantomEthereumProvider | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize provider and auto-connect
  useEffect(() => {
    const phantomProvider = getPhantomEthereumProvider();
    setProvider(phantomProvider);

    if (phantomProvider) {
      // Check initial connection status
      const status = getEthereumConnectionStatus();
      setIsConnected(status.isConnected);
      setAddress(status.address);
      setChainId(status.chainId);

      // Check if user manually disconnected before attempting auto-connect
      const manuallyDisconnected =
        localStorage.getItem("phantom_evm_manually_disconnected") === "true";

      // Auto-connect if previously connected (silent reconnection) and not manually disconnected
      if (!status.isConnected && !manuallyDisconnected) {
        phantomProvider
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              console.log(
                "🔄 Auto-connected to Phantom Ethereum:",
                accounts[0]
              );
              setIsConnected(true);
              setAddress(accounts[0]);
              // Get chain ID
              phantomProvider
                .request({ method: "eth_chainId" })
                .then((chainId: string) => {
                  setChainId(chainId);
                })
                .catch(console.error);
            }
          })
          .catch((error) => {
            // Silent fail for auto-connect - user needs to manually connect
            console.log(
              "ℹ️ Auto-connect not available, manual connection required"
            );
          });
      }
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!provider) return;

    const handleConnect = (connectionInfo: { chainId: string }) => {
      setIsConnected(true);
      setChainId(connectionInfo.chainId);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setAddress(null);
      setChainId(null);
      setIsConnecting(false);
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      } else {
        setAddress(null);
        setIsConnected(false);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
    };

    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
      provider.off("accountsChanged", handleAccountsChanged);
      provider.off("chainChanged", handleChainChanged);
    };
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider) {
      console.warn("⚠️ Phantom Ethereum provider not available");
      setIsConnecting(false);
      throw new Error(
        "Phantom wallet not detected. Please install Phantom wallet extension."
      );
    }

    setIsConnecting(true);
    try {
      const accounts = await connectPhantomEthereum();
      if (accounts && accounts.length > 0) {
        // Clear manual disconnect flag when user manually connects
        localStorage.removeItem("phantom_evm_manually_disconnected");
        setIsConnected(true);
        setAddress(accounts[0]);

        // Dispatch immediate balance update event
        window.dispatchEvent(
          new CustomEvent("walletBalanceUpdateNeeded", {
            detail: { walletType: "evm", immediate: true },
          })
        );
      }
      return accounts;
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  }, [provider]);

  const disconnect = useCallback(async () => {
    // Note: Phantom Ethereum doesn't support programmatic disconnect
    // Users must disconnect through the wallet UI
    console.warn("Phantom Ethereum doesn't support programmatic disconnect");
  }, []);

  return {
    provider,
    isConnected,
    address,
    chainId,
    isConnecting,
    connect,
    disconnect,
    isInstalled: !!provider,
  };
};

// Combined Phantom Wallet Hook
export const usePhantomWallet = () => {
  const solana = usePhantomSolana();
  const ethereum = usePhantomEthereum();

  const isAnyConnected = solana.isConnected || ethereum.isConnected;
  const isAnyConnecting = solana.isConnecting || ethereum.isConnecting;
  const isInstalled = solana.isInstalled || ethereum.isInstalled;

  return {
    solana,
    ethereum,
    isAnyConnected,
    isAnyConnecting,
    isInstalled,
  };
};
