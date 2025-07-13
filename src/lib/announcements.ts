import { supabaseAdmin } from "@/integrations/supabase/server"; // Menggunakan supabaseAdmin
import { validateUUIDWithLogging } from "@/lib/uuid-validation";

export interface Announcement {
  id: string;
  title: string;
  description: string | null;
  publicationDate: string;
  link: string | null;
}

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("announcements")
    .select("*")
    .order("publication_date", { ascending: false });

  if (error) {
    console.error("Error fetching all announcements:", error);
    return [];
  }

  if (data) {
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      publicationDate: item.publication_date,
      link: item.link,
    }));
  }
  return [];
}

export async function getAnnouncementById(
  id: string
): Promise<Announcement | null> {
  // Validate UUID format before making database query
  if (!validateUUIDWithLogging(id, "getAnnouncementById")) {
    return null;
  }

  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("announcements")
    .select("*")
    .eq("id", id)
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
