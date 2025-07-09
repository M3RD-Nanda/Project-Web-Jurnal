import { supabase } from "@/integrations/supabase/client";

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  publicationDate: string;
  link: string | null;
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('publication_date', { ascending: false });

  if (error) {
    console.error("Error fetching all announcements:", error);
    return [];
  }

  if (data) {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      publicationDate: item.publication_date,
      link: item.link,
    }));
  }
  return [];
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching announcement with ID ${id}:`, error);
    return null;
  }

  if (data) {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      publicationDate: data.publication_date,
      link: data.link,
    };
  }
  return null;
}

export async function insertAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<{ data: Announcement | null; error: Error | null }> {
  const { data, error } = await supabase
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
    console.error("Error inserting announcement:", error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Announcement, error: null };
}

export async function updateAnnouncement(id: string, announcement: Partial<Omit<Announcement, 'id'>>): Promise<{ data: Announcement | null; error: Error | null }> {
  const { data, error } = await supabase
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
    console.error(`Error updating announcement with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Announcement, error: null };
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting announcement with ID ${id}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}