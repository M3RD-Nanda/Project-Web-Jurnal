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

  // Function to fetch profile based on authenticated user
  const fetchProfile = async (currentSession: Session | null) => {
    if (currentSession) {
      // Use getUser() to verify the user is authentic
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error verifying user:", userError);
        setProfile(null);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
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
        // Verify current user authentication securely
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error getting user:", userError);
          setSession(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // If user is authenticated, get the current session
        if (user) {
          const {
            data: { session: currentSession },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Error getting session:", sessionError);
            setSession(null);
            setProfile(null);
          } else {
            // Use current session if no initial session was provided
            const sessionToUse = currentSession || initialSession;
            setSession(sessionToUse);

            if (sessionToUse) {
              await fetchProfile(sessionToUse);
            }
          }
        } else {
          // No authenticated user, use initial session if provided
          setSession(initialSession);
          if (initialSession) {
            await fetchProfile(initialSession);
          }
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        setSession(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();

    // Set up periodic session refresh to handle token expiration
    const refreshInterval = setInterval(async () => {
      try {
        // First verify user is still authenticated
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!userError && user) {
          // User is authenticated, get fresh session
          const {
            data: { session: refreshedSession },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (!sessionError && refreshedSession) {
            setSession(refreshedSession);
          }
        } else {
          // User is no longer authenticated
          setSession(null);
          setProfile(null);
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
      console.log("Auth state change:", event);

      setSession(currentSession);

      // For security, verify user authenticity when session exists
      if (currentSession) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "Error verifying user during auth state change:",
            userError
          );
          setSession(null);
          setProfile(null);
          return;
        }

        console.log("Verified user:", user.email);
        await fetchProfile(currentSession);

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
