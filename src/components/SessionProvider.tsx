"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateEnvironment, validateSupabaseConfig } from "@/lib/env-check";
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
  // This function should only be called with a verified user object from getUser()
  const fetchProfile = async (authenticatedUser: any) => {
    if (!authenticatedUser) {
      setProfile(null);
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authenticatedUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        console.log("No profile found for user, setting to null");
        setProfile(null);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  // Fetch profile initially based on initialSession
  useEffect(() => {
    const initializeProfile = async () => {
      if (initialSession) {
        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (!error && user) {
            await fetchProfile(user);
          }
        } catch (error) {
          console.error("Error getting user for initial profile:", error);
        }
      }
    };
    initializeProfile();
  }, [initialSession]);

  // Initialize session on mount
  useEffect(() => {
    // Validate environment configuration first
    console.log("SessionProvider: Validating environment...");
    const envValidation = validateEnvironment();
    const supabaseValidation = validateSupabaseConfig();

    if (!envValidation.isValid || !supabaseValidation) {
      console.error(
        "❌ Environment configuration is invalid. Authentication may not work properly."
      );
      toast.error(
        "Konfigurasi environment tidak valid. Silakan hubungi administrator."
      );
      setIsLoading(false);
      return;
    }

    const initializeSession = async () => {
      try {
        // First check if we have a session before calling getUser
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setSession(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        // Only call getUser if we have a session to avoid AuthSessionMissingError
        if (currentSession) {
          try {
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (userError) {
              // Handle AuthSessionMissingError specifically
              if (userError.message?.includes("Auth session missing")) {
                console.log("No active session found, setting session to null");
                setSession(null);
                setProfile(null);
                setIsLoading(false);
                return;
              }
              console.error("Error getting user:", userError);
              setSession(null);
              setProfile(null);
              setIsLoading(false);
              return;
            }

            if (user) {
              // Use current session if user is authenticated
              const sessionToUse = currentSession || initialSession;
              setSession(sessionToUse);

              // Fetch profile using the authenticated user object
              await fetchProfile(user);
            } else {
              setSession(null);
              setProfile(null);
            }
          } catch (authError: any) {
            // Handle AuthSessionMissingError specifically
            if (authError.message?.includes("Auth session missing")) {
              console.log(
                "Auth session missing during user verification, clearing session"
              );
              setSession(null);
              setProfile(null);
            } else {
              console.error("Error during user authentication:", authError);
              setSession(null);
              setProfile(null);
            }
          }
        } else {
          // No session available, use initial session if provided
          setSession(initialSession);
          if (initialSession) {
            // Get authenticated user for profile fetch
            try {
              const {
                data: { user },
                error,
              } = await supabase.auth.getUser();
              if (!error && user) {
                await fetchProfile(user);
              }
            } catch (error) {
              console.error("Error getting user for profile:", error);
            }
          }
        }
      } catch (error: any) {
        // Handle AuthSessionMissingError specifically
        if (error.message?.includes("Auth session missing")) {
          console.log(
            "Auth session missing during initialization, clearing session"
          );
        } else {
          console.error("Error initializing session:", error);
        }
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
        // First check if we have a session before calling getUser
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session during refresh:", sessionError);
          return;
        }

        // Only call getUser if we have a session to avoid AuthSessionMissingError
        if (currentSession) {
          try {
            const {
              data: { user },
              error: userError,
            } = await supabase.auth.getUser();

            if (!userError && user) {
              // User is authenticated, use the current session
              setSession(currentSession);
            } else {
              // Handle AuthSessionMissingError or other auth errors
              if (userError?.message?.includes("Auth session missing")) {
                console.log(
                  "Auth session missing during refresh, clearing session"
                );
              } else if (userError) {
                console.error("Error getting user during refresh:", userError);
              }
              setSession(null);
              setProfile(null);
            }
          } catch (authError: any) {
            // Handle AuthSessionMissingError specifically
            if (authError.message?.includes("Auth session missing")) {
              console.log(
                "Auth session missing during refresh verification, clearing session"
              );
            } else {
              console.error(
                "Error during user verification in refresh:",
                authError
              );
            }
            setSession(null);
            setProfile(null);
          }
        } else {
          // No session available
          setSession(null);
          setProfile(null);
        }
      } catch (error: any) {
        // Handle AuthSessionMissingError specifically
        if (error.message?.includes("Auth session missing")) {
          console.log(
            "Auth session missing during session refresh, clearing session"
          );
          setSession(null);
          setProfile(null);
        } else {
          console.error("Error refreshing session:", error);
        }
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [initialSession]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, _sessionFromEvent) => {
      console.log("Auth state change:", event);

      // For security, never use session directly from the event
      // Always verify user first, then get fresh session
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          // First check if we have a session before calling getUser
          const {
            data: { session: currentSession },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error(
              "Error getting session during auth state change:",
              sessionError
            );
            setSession(null);
            setProfile(null);
            return;
          }

          // Only call getUser if we have a session to avoid AuthSessionMissingError
          if (currentSession) {
            try {
              const {
                data: { user },
                error: userError,
              } = await supabase.auth.getUser();

              if (userError) {
                // Handle AuthSessionMissingError specifically
                if (userError.message?.includes("Auth session missing")) {
                  console.log(
                    "Auth session missing during auth state change, clearing session"
                  );
                } else {
                  console.error(
                    "Error verifying user during auth state change:",
                    userError
                  );
                }
                setSession(null);
                setProfile(null);
                return;
              }

              if (user) {
                console.log("Verified user:", user.email);
                setSession(currentSession);

                // Fetch profile using the authenticated user object
                await fetchProfile(user);

                if (event === "SIGNED_IN") {
                  toast.success("Anda berhasil masuk!");
                  router.push("/");
                } else if (event === "TOKEN_REFRESHED") {
                  console.log("Token refreshed successfully");
                }
              } else {
                setSession(null);
                setProfile(null);
              }
            } catch (authError: any) {
              // Handle AuthSessionMissingError specifically
              if (authError.message?.includes("Auth session missing")) {
                console.log(
                  "Auth session missing during user verification in auth state change, clearing session"
                );
              } else {
                console.error(
                  "Error during user verification in auth state change:",
                  authError
                );
              }
              setSession(null);
              setProfile(null);
            }
          } else {
            // No session available
            setSession(null);
            setProfile(null);
          }
        } catch (error: any) {
          // Handle AuthSessionMissingError specifically
          if (error.message?.includes("Auth session missing")) {
            console.log(
              "Auth session missing during auth state change, clearing session"
            );
          } else {
            console.error("Error in auth state change handler:", error);
          }
          setSession(null);
          setProfile(null);
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
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
