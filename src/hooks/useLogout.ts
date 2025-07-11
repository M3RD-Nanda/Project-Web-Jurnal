"use client";

import { useSupabase } from "@/components/SessionProvider";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function useLogout() {
  const { supabase, session } = useSupabase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    console.log("Attempting to log out...");

    try {
      // Disconnect wallet and clear from database if mounted and user is logged in
      if (mounted && session?.user?.id) {
        try {
          // Clear wallet data from database
          const { error } = await supabase.rpc("disconnect_wallet", {
            user_uuid: session.user.id,
          });

          if (error) {
            console.error("Error clearing saved wallet:", error);
          } else {
            console.log("Wallet data cleared from database");
          }

          // Note: Wallet will be disconnected automatically when Web3Provider unmounts
          console.log(
            "Wallet disconnect will be handled by Web3Provider cleanup"
          );
        } catch (error) {
          console.error("Error disconnecting wallet:", error);
          // Continue with logout even if wallet disconnect fails
        }
      }

      // Clear any local storage items related to auth
      if (typeof window !== "undefined") {
        // Clear Supabase auth tokens from localStorage
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });
      }

      // Then logout from Supabase
      const { error } = await supabase.auth.signOut({
        scope: "local", // This ensures we clear local session
      });

      if (error) {
        console.error("Logout error:", error);
        toast.error(`Gagal logout: ${error.message}`);
      } else {
        console.log(
          "Logout successful, SessionProvider should handle redirect."
        );
        toast.success("Berhasil logout");
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Terjadi kesalahan saat logout");
    }
  };

  return { logout };
}
