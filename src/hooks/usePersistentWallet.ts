"use client";

import { useEffect, useState } from "react";
import {
  useAccountSafe,
  useChainIdSafe,
  useConnectSafe,
  useDisconnectSafe,
} from "./useWagmiSafe";
import { useSupabase } from "@/components/SessionProvider";
import { toast } from "sonner";
import { type Connector } from "wagmi";

interface WalletConnection {
  wallet_address: string;
  wallet_type: string | null;
  chain_id: number | null;
  last_connected_at: string;
}

export function usePersistentWallet() {
  const { address, isConnected, connector } = useAccountSafe();
  const chainId = useChainIdSafe();
  const { connect, connectors } = useConnectSafe();
  const { disconnect } = useDisconnectSafe();
  const { supabase, session } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [savedWallet, setSavedWallet] = useState<WalletConnection | null>(null);

  // Load saved wallet connection when user logs in
  useEffect(() => {
    if (session?.user?.id && !isConnected) {
      loadSavedWallet();
    }
  }, [session?.user?.id, isConnected]);

  // Save wallet connection when wallet connects
  useEffect(() => {
    if (isConnected && address && session?.user?.id) {
      saveWalletConnection();
    }
  }, [isConnected, address, chainId, connector, session?.user?.id]);

  const loadSavedWallet = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);

      // Call the get_active_wallet function
      const { data, error } = await supabase.rpc("get_active_wallet", {
        user_uuid: session.user.id,
      });

      if (error) {
        console.error("Error loading saved wallet:", error);
        return;
      }

      if (data && data.length > 0) {
        const walletData = data[0];
        setSavedWallet(walletData);

        // Try to auto-reconnect if wallet is not currently connected
        if (!isConnected) {
          await attemptAutoReconnect(walletData);
        }
      }
    } catch (error) {
      console.error("Error in loadSavedWallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const attemptAutoReconnect = async (walletData: WalletConnection) => {
    try {
      // Find the connector that was previously used
      const savedConnector = connectors.find((c: Connector) =>
        c.name
          .toLowerCase()
          .includes(walletData.wallet_type?.toLowerCase() || "")
      );

      if (savedConnector) {
        console.log(`Attempting to reconnect to ${walletData.wallet_type}...`);
        connect({ connector: savedConnector });
      }
    } catch (error) {
      console.error("Auto-reconnect failed:", error);
      // Don't show error to user for auto-reconnect failures
    }
  };

  const saveWalletConnection = async () => {
    if (!session?.user?.id || !address || !connector) return;

    try {
      const walletType = connector.name.toLowerCase();

      // Call the set_active_wallet function
      const { error } = await supabase.rpc("set_active_wallet", {
        user_uuid: session.user.id,
        wallet_addr: address,
        wallet_type_param: walletType,
        chain_id_param: chainId,
      });

      if (error) {
        console.error("Error saving wallet connection:", error);
        toast.error("Failed to save wallet connection");
        return;
      }

      console.log("Wallet connection saved successfully");

      // Update local state
      setSavedWallet({
        wallet_address: address,
        wallet_type: walletType,
        chain_id: chainId,
        last_connected_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in saveWalletConnection:", error);
      toast.error("Failed to save wallet connection");
    }
  };

  const disconnectAndClear = async () => {
    if (!session?.user?.id) {
      // Just disconnect wallet if no session
      disconnect();
      return;
    }

    try {
      // Disconnect from database
      const { error } = await supabase.rpc("disconnect_wallet", {
        user_uuid: session.user.id,
      });

      if (error) {
        console.error("Error disconnecting wallet from database:", error);
      }

      // Disconnect wallet
      disconnect();

      // Clear local state
      setSavedWallet(null);

      console.log("Wallet disconnected and cleared from database");
    } catch (error) {
      console.error("Error in disconnectAndClear:", error);
      // Still disconnect wallet even if database operation fails
      disconnect();
    }
  };

  const clearSavedWallet = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase.rpc("disconnect_wallet", {
        user_uuid: session.user.id,
      });

      if (error) {
        console.error("Error clearing saved wallet:", error);
        toast.error("Failed to clear saved wallet");
        return;
      }

      setSavedWallet(null);
      toast.success("Saved wallet cleared");
    } catch (error) {
      console.error("Error in clearSavedWallet:", error);
      toast.error("Failed to clear saved wallet");
    }
  };

  return {
    savedWallet,
    isLoading,
    saveWalletConnection,
    disconnectAndClear,
    clearSavedWallet,
    loadSavedWallet,
  };
}