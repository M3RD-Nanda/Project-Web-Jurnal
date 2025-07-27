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
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null
  );

  // Get authenticated user ID safely
  useEffect(() => {
    const getAuthenticatedUser = async () => {
      if (session) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (!error && user) {
          setAuthenticatedUserId(user.id);
        } else {
          setAuthenticatedUserId(null);
        }
      } else {
        setAuthenticatedUserId(null);
      }
    };

    getAuthenticatedUser();
  }, [session, supabase]);

  // Load saved wallet connection when user logs in (but don't auto-connect)
  useEffect(() => {
    if (authenticatedUserId && !isConnected) {
      loadSavedWalletInfo();
    }
  }, [authenticatedUserId, isConnected]);

  // Save wallet connection when wallet connects
  useEffect(() => {
    if (isConnected && address && authenticatedUserId) {
      saveWalletConnection();
    }
  }, [isConnected, address, chainId, connector, authenticatedUserId]);

  // Load saved wallet info without auto-connecting
  const loadSavedWalletInfo = async () => {
    if (!authenticatedUserId) return;

    try {
      setIsLoading(true);

      // Call the get_active_wallet function
      const { data, error } = await supabase.rpc("get_active_wallet", {
        user_uuid: authenticatedUserId,
      });

      if (error) {
        console.error("Error loading saved wallet:", error);
        return;
      }

      if (data && data.length > 0) {
        const walletData = data[0];
        setSavedWallet(walletData);
        // Don't auto-connect, just store the info
      }
    } catch (error) {
      console.error("Error in loadSavedWalletInfo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual reconnect function for user-initiated connections
  const loadSavedWallet = async () => {
    if (!authenticatedUserId) return;

    try {
      setIsLoading(true);

      // Call the get_active_wallet function
      const { data, error } = await supabase.rpc("get_active_wallet", {
        user_uuid: authenticatedUserId,
      });

      if (error) {
        console.error("Error loading saved wallet:", error);
        return;
      }

      if (data && data.length > 0) {
        const walletData = data[0];
        setSavedWallet(walletData);

        // Try to reconnect if wallet is not currently connected
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
        connect({ connector: savedConnector });
      }
    } catch (error) {
      console.error("Auto-reconnect failed:", error);
      // Don't show error to user for auto-reconnect failures
    }
  };

  const saveWalletConnection = async () => {
    if (!authenticatedUserId || !address || !connector) return;

    try {
      const walletType = connector.name.toLowerCase();

      // Call the set_active_wallet function
      const { error } = await supabase.rpc("set_active_wallet", {
        user_uuid: authenticatedUserId,
        wallet_addr: address,
        wallet_type_param: walletType,
        chain_id_param: chainId,
      });

      if (error) {
        console.error("Error saving wallet connection:", error);
        toast.error("Failed to save wallet connection");
        return;
      }

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
    if (!authenticatedUserId) {
      // Just disconnect wallet if no authenticated user
      disconnect();
      return;
    }

    try {
      // Disconnect from database
      const { error } = await supabase.rpc("disconnect_wallet", {
        user_uuid: authenticatedUserId,
      });

      if (error) {
        console.error("Error disconnecting wallet from database:", error);
      }

      // Disconnect wallet
      disconnect();

      // Clear local state
      setSavedWallet(null);
    } catch (error) {
      console.error("Error in disconnectAndClear:", error);
      // Still disconnect wallet even if database operation fails
      disconnect();
    }
  };

  const clearSavedWallet = async () => {
    if (!authenticatedUserId) return;

    try {
      const { error } = await supabase.rpc("disconnect_wallet", {
        user_uuid: authenticatedUserId,
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
