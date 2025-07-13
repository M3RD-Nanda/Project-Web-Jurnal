"use client";

import { useSupabase } from "@/components/SessionProvider";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { clearAllCaches } from "@/lib/profile-cache";

export function useLogout() {
  const { supabase, session } = useSupabase();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    try {
      // Disconnect wallet and clear from database if mounted and user is logged in
      if (mounted && session) {
        try {
          // Get authenticated user ID safely
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (!userError && user) {
            // Clear wallet data from database
            const { error } = await supabase.rpc("disconnect_wallet", {
              user_uuid: user.id,
            });

            if (error) {
              console.error("Error clearing saved wallet:", error);
            } else {
            }
          }

          // Note: Wallet will be disconnected automatically when Web3Provider unmounts
        } catch (error) {
          console.error("Error disconnecting wallet:", error);
          // Continue with logout even if wallet disconnect fails
        }
      }

      // Clear all caches and local storage items related to auth
      if (typeof window !== "undefined") {
        // Clear profile and session caches
        clearAllCaches();

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
        // Logout successful, SessionProvider should handle redirect
        toast.success("Berhasil logout");
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      toast.error("Terjadi kesalahan saat logout");
    }
  };

  return { logout };
}
