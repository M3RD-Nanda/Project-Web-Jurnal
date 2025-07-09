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
}

interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
  profile: UserProfile | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  initialSession: Session | null; // Add initialSession prop
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  // Function to fetch profile based on session
  const fetchProfile = async (currentSession: Session | null) => {
    if (currentSession) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      await fetchProfile(currentSession); // Fetch profile on auth state change

      if (currentSession) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          toast.success("Anda berhasil masuk!");
          router.push("/"); // Redirect ke halaman utama setelah login
        }
      } else if (event === 'SIGNED_OUT') {
        toast.info("Anda telah keluar.");
        router.push("/login"); // Redirect ke halaman login setelah logout
      }
    });

    return () => subscription.unsubscribe();
  }, [router]); // Removed supabase.auth from dependency array as it's stable

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