"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/integrations/supabase/server";
import { Announcement } from "@/lib/announcements";

export async function createAnnouncementAction(announcement: Omit<Announcement, 'id'>): Promise<{ data: Announcement | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .insert({
      title: announcement.title,
      description: announcement.description,
      publication_date: announcement.publicationDate,
      link: announcement.link,
    })
    .select()
    .single();

  if (error) {
    console.error("Server Action: Error inserting announcement:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/"); // Revalidate home page for latest announcements
  revalidatePath(`/announcements/${data.id}`); // Revalidate the new announcement's detail page
  return { data: data as Announcement, error: null };
}

export async function updateAnnouncementAction(id: string, announcement: Partial<Omit<Announcement, 'id'>>): Promise<{ data: Announcement | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .update({
      title: announcement.title,
      description: announcement.description,
      publication_date: announcement.publicationDate,
      link: announcement.link,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Server Action: Error updating announcement with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/"); // Revalidate home page for latest announcements
  revalidatePath(`/announcements/${id}`); // Revalidate the updated announcement's detail page
  return { data: data as Announcement, error: null };
}

export async function deleteAnnouncementAction(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Server Action: Error deleting announcement with ID ${id}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/announcements");
  revalidatePath("/"); // Revalidate home page for latest announcements
  revalidatePath(`/announcements/${id}`); // Revalidate the deleted announcement's detail page
  return { success: true, error: null };
}