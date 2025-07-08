"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react"; // Import React for Fragment

interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' || event === 'SIGNED_IN') {
        setSession(session);
        if (session) {
          toast.success("Anda berhasil masuk!");
          router.push("/"); // Redirect ke halaman utama setelah login
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        toast.info("Anda telah keluar.");
        router.push("/login"); // Redirect ke halaman login setelah logout
      } else if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      <React.Fragment>{children}</React.Fragment>
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SessionProvider");
  }
  return context;
}