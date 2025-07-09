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