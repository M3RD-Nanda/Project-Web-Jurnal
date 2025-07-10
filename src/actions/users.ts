"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/integrations/supabase/server";
import { UserProfile } from "@/lib/users";

export async function updateProfileAdminAction(
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
      console.error("Server Action: Error updating auth user metadata:", authUpdateError);
      return { data: null, error: new Error(authUpdateError.message) };
    }
  }

  // Update public.profiles table
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId, // Ensure ID is passed for upsert
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
    }, { onConflict: 'id' }) // Use onConflict for upsert behavior
    .select()
    .single();

  if (error) {
    console.error(`Server Action: Error updating profile for user ${userId}:`, error);
    return { data: null, error: new Error(error.message) };
  }

  // Re-fetch the combined user profile to return the most up-to-date data
  const { data: updatedUser, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error("Server Action: Error re-fetching updated profile:", fetchError);
    return { data: null, error: new Error(fetchError.message) };
  }

  const { data: authUserAfterUpdate, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authUserError) {
    console.error("Server Action: Error fetching auth user after update:", authUserError);
    return { data: null, error: new Error(authUserError.message) };
  }

  revalidatePath("/admin/users");
  revalidatePath("/profile"); // Revalidate user's own profile page
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

export async function deleteUserAdminAction(userId: string): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error(`Server Action: Error deleting user ${userId}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  revalidatePath("/admin/users");
  return { success: true, error: null };
}