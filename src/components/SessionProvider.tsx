"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateEnvironment, validateSupabaseConfig } from "@/lib/env-check";
import {
  getCachedProfile,
  setCachedProfile,
  clearAllCaches,
  getCachedSession,
  setCachedSession,
  preloadProfileData,
  type CachedUserProfile,
} from "@/lib/profile-cache";
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
  const fetchProfile = async (
    authenticatedUser: any,
    useCache: boolean = true
  ) => {
    if (!authenticatedUser) {
      setProfile(null);
      return;
    }

    // Try to get from cache first if enabled
    if (useCache && session?.access_token) {
      const cachedProfile = getCachedProfile(session.access_token);
      if (cachedProfile) {
        // Convert cached profile to full UserProfile format
        const fullProfile: UserProfile = {
          id: cachedProfile.id,
          first_name: null,
          last_name: null,
          username: null,
          role: cachedProfile.role,
          salutation: null,
          middle_name: null,
          initials: null,
          gender: null,
          affiliation: null,
          signature: null,
          orcid_id: null,
          url: null,
          phone: null,
          fax: null,
          mailing_address: null,
          bio_statement: null,
          country: null,
          is_reader: false,
          is_author: false,
          profile_image_url: null,
          wallet_address: null,
        };
        setProfile(fullProfile);
        console.log("✅ Profile loaded from cache, skipping API call");
        return;
      }
    }

    try {
      // Use native Supabase query with timeout
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", authenticatedUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000);
      });

      const { data: profileData, error } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any;

      if (error && error.code !== "PGRST116") {
        setProfile(null);
        return;
      }

      if (profileData) {
        const userProfile = profileData as UserProfile;
        setProfile(userProfile);

        // Cache the profile data for future use
        if (session?.access_token) {
          const cachedProfile: CachedUserProfile = {
            id: userProfile.id,
            email: session.user?.email || "",
            full_name:
              userProfile.first_name && userProfile.last_name
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : userProfile.first_name || userProfile.last_name,
            role: userProfile.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCachedProfile(cachedProfile, session.access_token);
        }
      } else {
        setProfile(null);
      }
    } catch (error: any) {
      if (error.message?.includes("timeout")) {
        // Silently handle timeout errors in development
        if (process.env.NODE_ENV !== "development") {
        }
      } else {
        console.error("Error fetching profile:", error);
      }
      setProfile(null);
    }
  };

  // Fetch profile initially based on initialSession
  useEffect(() => {
    const initializeProfile = async () => {
      if (initialSession) {
        // Cache the session for quick access
        setCachedSession(initialSession);

        try {
          // Use native Supabase method with timeout
          const userPromise = supabase.auth.getUser();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error("Initial user fetch timeout")),
              5000
            );
          });

          const { data: userData, error } = (await Promise.race([
            userPromise,
            timeoutPromise,
          ])) as any;

          if (!error && userData?.user) {
            await fetchProfile(userData.user, true); // Enable cache for initial load
          }
        } catch (error: any) {
          if (error.message?.includes("timeout")) {
            // Silently handle timeout errors in development
            if (process.env.NODE_ENV !== "development") {
            }
          } else {
            console.error("Error getting user for initial profile:", error);
          }
        }
      }
    };
    initializeProfile();
  }, [initialSession]);

  // Initialize session on mount with graceful error handling
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Validate environment configuration first
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

        // Use native Supabase methods with timeout handling
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Session initialization timeout")),
            8000
          );
        });

        const { data: sessionData, error: sessionError } = (await Promise.race([
          sessionPromise,
          timeoutPromise,
        ])) as any;

        if (sessionError) {
          setSession(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        const currentSession = sessionData?.session;

        if (currentSession) {
          setSession(currentSession);

          // Try to fetch user data, but don't fail if it times out
          try {
            const userPromise = supabase.auth.getUser();
            const userTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("User fetch timeout")), 5000);
            });

            const { data: userData, error: userError } = (await Promise.race([
              userPromise,
              userTimeoutPromise,
            ])) as any;

            if (!userError && userData?.user) {
              await fetchProfile(userData.user);
            }
          } catch (userFetchError) {
            // Continue with session even if user fetch fails
          }
        } else {
          setSession(null);
          setProfile(null);
        }
      } catch (error: any) {
        // Handle timeout and other errors gracefully
        if (error.message?.includes("timeout")) {
          // Session initialization timed out, continuing without session
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
  }, [initialSession]);

  // Set up auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sessionFromEvent) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          // Use the session from the event if available, otherwise fetch it
          let currentSession = sessionFromEvent;

          if (!currentSession) {
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () => reject(new Error("Auth state session timeout")),
                5000
              );
            });

            const { data: sessionData, error: sessionError } =
              (await Promise.race([sessionPromise, timeoutPromise])) as any;

            if (sessionError) {
              return;
            }
            currentSession = sessionData?.session;
          }

          if (currentSession) {
            setSession(currentSession);

            // Try to fetch user and profile, but don't fail if it times out
            try {
              const userPromise = supabase.auth.getUser();
              const userTimeoutPromise = new Promise((_, reject) => {
                setTimeout(
                  () => reject(new Error("Auth state user timeout")),
                  3000
                );
              });

              const { data: userData, error: userError } = (await Promise.race([
                userPromise,
                userTimeoutPromise,
              ])) as any;

              if (!userError && userData?.user) {
                await fetchProfile(userData.user);
              }
            } catch (userFetchError: any) {
              // Only log non-timeout errors in development
              if (
                process.env.NODE_ENV === "development" &&
                !userFetchError.message?.includes("timeout")
              ) {
              }
              // Continue with session even if user fetch fails
            }
          }
        } catch (error: any) {
          if (error.message?.includes("timeout")) {
            // Silently handle timeout errors - don't log in development
            if (process.env.NODE_ENV !== "development") {
            }
          } else {
            console.error("Error handling auth state change:", error);
          }
          // Don't clear session on timeout, only on actual errors
          if (!error.message?.includes("timeout")) {
            setSession(null);
            setProfile(null);
          }
        }
      } else if (event === "SIGNED_OUT") {
        // Clear all caches when user signs out
        clearAllCaches();
        setSession(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
