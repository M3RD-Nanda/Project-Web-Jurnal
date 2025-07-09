import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  fullContent: string;
  publicationDate: string;
  keywords: string[];
  issueId: string | null; // Add issueId to the interface
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching article by ID:", error);
    return undefined;
  }

  if (data) {
    return {
      id: data.id,
      title: data.title,
      authors: data.authors,
      abstract: data.abstract,
      fullContent: data.full_content,
      publicationDate: data.publication_date,
      keywords: data.keywords || [],
      issueId: data.issue_id,
    };
  }
  return undefined;
}

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('publication_date', { ascending: false });

  if (error) {
    console.error("Error fetching all articles:", error);
    return [];
  }

  if (data) {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      authors: item.authors,
      abstract: item.abstract,
      fullContent: item.full_content,
      publicationDate: item.publication_date,
      keywords: item.keywords || [],
      issueId: item.issue_id,
    }));
  }
  return [];
}

export async function getArticlesByIssueId(issueId: string): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('issue_id', issueId)
    .order('publication_date', { ascending: false });

  if (error) {
    console.error(`Error fetching articles for issue ${issueId}:`, error);
    return [];
  }

  if (data) {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      authors: item.authors,
      abstract: item.abstract,
      fullContent: item.full_content,
      publicationDate: item.publication_date,
      keywords: item.keywords || [],
      issueId: item.issue_id,
    }));
  }
  return [];
}