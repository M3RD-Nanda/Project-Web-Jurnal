import { supabaseAdmin } from "@/integrations/supabase/server";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string; // From auth.users
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
  created_at: string; // From auth.users
}

export async function getAllUsersWithProfiles(): Promise<UserProfile[]> {
  // Fetch all users from auth.users (requires service role key)
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error("Error listing auth users:", authError);
    return [];
  }

  const userIds = authUsers.users.map(user => user.id);

  // Fetch profiles for these users
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return [];
  }

  const userProfilesMap = new Map<string, any>();
  profiles.forEach(profile => userProfilesMap.set(profile.id, profile));

  // Combine auth user data with profile data
  const combinedUsers: UserProfile[] = authUsers.users.map(authUser => {
    const profile = userProfilesMap.get(authUser.id);
    return {
      id: authUser.id,
      email: authUser.email || 'N/A',
      first_name: profile?.first_name || authUser.user_metadata?.first_name || null,
      last_name: profile?.last_name || authUser.user_metadata?.last_name || null,
      username: profile?.username || null,
      role: profile?.role || 'user', // Default to 'user' if not set in profile
      salutation: profile?.salutation || null,
      middle_name: profile?.middle_name || null,
      initials: profile?.initials || null,
      gender: profile?.gender || null,
      affiliation: profile?.affiliation || null,
      signature: profile?.signature || null,
      orcid_id: profile?.orcid_id || null,
      url: profile?.url || null,
      phone: profile?.phone || null,
      fax: profile?.fax || null,
      mailing_address: profile?.mailing_address || null,
      bio_statement: profile?.bio_statement || null,
      country: profile?.country || null,
      is_reader: profile?.is_reader ?? true,
      is_author: profile?.is_author ?? false,
      profile_image_url: profile?.profile_image_url || null,
      created_at: authUser.created_at,
    };
  });

  return combinedUsers;
}

export async function updateUserProfile(
  userId: string,
  profileData: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at'>>,
  authMetadata?: { first_name?: string; last_name?: string }
): Promise<{ data: UserProfile | null; error: Error | null }> {
  // Update auth.users metadata if provided
  if (authMetadata && (authMetadata.first_name !== undefined || authMetadata.last_name !== undefined)) {
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        first_name: authMetadata.first_name,
        last_name: authMetadata.last_name,
      },
    });
    if (authUpdateError) {
      console.error("Error updating auth user metadata:", authUpdateError);
      return { data: null, error: new Error(authUpdateError.message) };
    }
  }

  // Update public.profiles table
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      username: profileData.username || null,
      salutation: profileData.salutation || null,
      first_name: profileData.first_name || null,
      middle_name: profileData.middle_name || null,
      last_name: profileData.last_name || null,
      initials: profileData.initials || null,
      gender: profileData.gender || null,
      affiliation: profileData.affiliation || null,
      signature: profileData.signature || null,
      orcid_id: profileData.orcid_id || null,
      url: profileData.url || null,
      phone: profileData.phone || null,
      fax: profileData.fax || null,
      mailing_address: profileData.mailing_address || null,
      bio_statement: profileData.bio_statement || null,
      country: profileData.country || null,
      is_reader: profileData.is_reader,
      is_author: profileData.is_author,
      profile_image_url: profileData.profile_image_url || null,
      role: profileData.role,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    return { data: null, error: new Error(error.message) };
  }

  // Re-fetch the combined user profile to return the most up-to-date data
  const { data: updatedUser, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error("Error re-fetching updated profile:", fetchError);
    return { data: null, error: new Error(fetchError.message) };
  }

  const { data: authUserAfterUpdate, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authUserError) {
    console.error("Error fetching auth user after update:", authUserError);
    return { data: null, error: new Error(authUserError.message) };
  }

  return {
    data: {
      id: updatedUser.id,
      email: authUserAfterUpdate.user?.email || 'N/A',
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      username: updatedUser.username,
      role: updatedUser.role,
      salutation: updatedUser.salutation,
      middle_name: updatedUser.middle_name,
      initials: updatedUser.initials,
      gender: updatedUser.gender,
      affiliation: updatedUser.affiliation,
      signature: updatedUser.signature,
      orcid_id: updatedUser.orcid_id,
      url: updatedUser.url,
      phone: updatedUser.phone,
      fax: updatedUser.fax,
      mailing_address: updatedUser.mailing_address,
      bio_statement: updatedUser.bio_statement,
      country: updatedUser.country,
      is_reader: updatedUser.is_reader,
      is_author: updatedUser.is_author,
      profile_image_url: updatedUser.profile_image_url,
      created_at: authUserAfterUpdate.user?.created_at || '',
    },
    error: null
  };
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}