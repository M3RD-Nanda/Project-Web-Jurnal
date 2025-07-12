import { supabaseAdmin } from "@/integrations/supabase/server"; // Menggunakan supabaseAdmin
import { v4 as uuidv4 } from "uuid"; // Import uuid

export interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  fullContent: string;
  publicationDate: string;
  keywords: string[];
  issueId: string | null;
  // Data edisi untuk tampilan
  issueVolume?: number;
  issueNumber?: number;
  issueYear?: number;
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("articles")
    .select(
      "id, title, authors, abstract, full_content, publication_date, keywords, issue_id"
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching article by ID:", error);
    return undefined;
  }

  if (data) {
    return {
      id: String(data.id || ""),
      title: String(data.title || ""),
      authors: String(data.authors || ""),
      abstract: String(data.abstract || ""),
      fullContent: String(data.full_content || ""),
      publicationDate: String(data.publication_date || ""),
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      issueId: data.issue_id ? String(data.issue_id) : null,
    };
  }
  return undefined;
}

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("articles")
    .select(
      `
      id,
      title,
      authors,
      abstract,
      full_content,
      publication_date,
      keywords,
      issue_id,
      issues (
        volume,
        number,
        year
      )
    `
    )
    .order("publication_date", { ascending: false });

  if (error) {
    console.error("Error fetching all articles:", error);
    return [];
  }

  if (data) {
    return data.map((item) => {
      // Ensure proper mapping with explicit field validation
      const mappedItem = {
        id: String(item.id || ""),
        title: String(item.title || ""),
        authors: String(item.authors || ""),
        abstract: String(item.abstract || ""),
        fullContent: String(item.full_content || ""),
        publicationDate: String(item.publication_date || ""),
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
        issueId: item.issue_id ? String(item.issue_id) : null,
        // Tambahkan data edisi jika tersedia
        issueVolume: item.issues?.volume || undefined,
        issueNumber: item.issues?.number || undefined,
        issueYear: item.issues?.year || undefined,
      };

      return mappedItem;
    });
  }
  return [];
}

export async function getArticlesByIssueId(
  issueId: string
): Promise<Article[]> {
  const { data, error } = await supabaseAdmin // Menggunakan supabaseAdmin untuk GET
    .from("articles")
    .select(
      "id, title, authors, abstract, full_content, publication_date, keywords, issue_id"
    )
    .eq("issue_id", issueId)
    .order("publication_date", { ascending: false });

  if (error) {
    console.error(`Error fetching articles for issue ${issueId}:`, error);
    return [];
  }

  if (data) {
    return data.map((item) => ({
      id: String(item.id || ""),
      title: String(item.title || ""),
      authors: String(item.authors || ""),
      abstract: String(item.abstract || ""),
      fullContent: String(item.full_content || ""),
      publicationDate: String(item.publication_date || ""),
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      issueId: item.issue_id ? String(item.issue_id) : null,
    }));
  }
  return [];
}
