import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid'; // Import uuid

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

export async function insertArticle(article: Omit<Article, 'id'>): Promise<{ data: Article | null; error: Error | null }> {
  const newId = uuidv4(); // Generate a new UUID for the article ID
  const { data, error } = await supabase
    .from('articles')
    .insert({
      id: newId, // Use the generated ID
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      full_content: article.fullContent,
      publication_date: article.publicationDate,
      keywords: article.keywords,
      issue_id: article.issueId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting article:", error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Article, error: null };
}

export async function updateArticle(id: string, article: Partial<Omit<Article, 'id'>>): Promise<{ data: Article | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('articles')
    .update({
      title: article.title,
      authors: article.authors,
      abstract: article.abstract,
      full_content: article.fullContent,
      publication_date: article.publicationDate,
      keywords: article.keywords,
      issue_id: article.issueId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating article with ID ${id}:`, error);
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as Article, error: null };
}

export async function deleteArticle(id: string): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting article with ID ${id}:`, error);
    return { success: false, error: new Error(error.message) };
  }
  return { success: true, error: null };
}