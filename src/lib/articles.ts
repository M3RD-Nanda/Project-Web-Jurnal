import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/server';

export type Article = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  fullContent: string;
  publicationDate: string;
  keywords: string[];
  issue_id?: string | null;
};

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase.from('articles').select('*').order('publication_date', { ascending: false });
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  return data as Article[];
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
  if (error) {
    console.error('Error fetching article by ID:', error);
    return null;
  }
  return data as Article;
}

export async function getArticlesByIssueId(issueId: string): Promise<Article[]> {
  const { data, error } = await supabase.from('articles').select('*').eq('issue_id', issueId).order('publication_date', { ascending: false });
  if (error) {
    console.error('Error fetching articles by issue ID:', error);
    return [];
  }
  return data as Article[];
}

export async function createArticle(articleData: Omit<Article, 'id'>) {
  const { data, error } = await supabaseAdmin.from('articles').insert(articleData).select().single();
  if (error) {
    console.error('Error creating article:', error);
    return { data: null, error };
  }
  return { data: data as Article, error: null };
}

export async function updateArticle(id: string, articleData: Partial<Omit<Article, 'id'>>) {
  const { data, error } = await supabaseAdmin.from('articles').update(articleData).eq('id', id).select().single();
  if (error) {
    console.error('Error updating article:', error);
    return { data: null, error };
  }
  return { data: data as Article, error: null };
}

export async function deleteArticle(id: string) {
  const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
  if (error) {
    console.error('Error deleting article:', error);
    return { success: false, error };
  }
  return { success: true, error: null };
}