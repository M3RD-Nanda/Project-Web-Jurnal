"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  role: string;
  salutation: string | null;
  middle_name: string | null;
  initials: string | null;
  gender: string | null;
  affiliation: string | null;
  signature: string | null;
  orcid_id: string | null;
  url: string | null;
  phone: string | null;
  fax: string | null;
  mailing_address: string | null;
  bio_statement: string | null;
  country: string | null;
  is_reader: boolean;
  is_author: boolean;
  profile_image_url: string | null;
  wallet_address: string | null;
}

interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
  profile: UserProfile | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession: Session | null; // Add initialSession prop
}

export function SessionProvider({
  children,
  initialSession,
}: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to fetch profile based on session
  const fetchProfile = async (currentSession: Session | null) => {
    if (currentSession) {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentSession.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        setProfile(null); // No profile found
      }
    } else {
      setProfile(null);
    }
  };

  // Fetch profile initially based on initialSession
  useEffect(() => {
    fetchProfile(initialSession);
  }, [initialSession]);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get current session from Supabase
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        // Use current session if no initial session was provided
        const sessionToUse = currentSession || initialSession;
        setSession(sessionToUse);

        if (sessionToUse) {
          await fetchProfile(sessionToUse);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Set up periodic session refresh to handle token expiration
    const refreshInterval = setInterval(async () => {
      try {
        const {
          data: { session: refreshedSession },
          error,
        } = await supabase.auth.getSession();
        if (!error && refreshedSession) {
          setSession(refreshedSession);
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [initialSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);

      setSession(currentSession);
      await fetchProfile(currentSession);

      if (currentSession) {
        if (event === "SIGNED_IN") {
          toast.success("Anda berhasil masuk!");
          router.push("/");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Token refreshed successfully");
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        toast.info("Anda telah keluar.");
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, profile }}>
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
