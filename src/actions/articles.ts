"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/integrations/supabase/server";
import { Article } from "@/lib/articles";
import { v4 as uuidv4 } from 'uuid';

export async function createArticleAction(article: Omit<Article, 'id'>): Promise<{ data: Article | null; error: string | null }> {
  const newId = uuidv4();
  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert({
      id: newId,
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
    console.error("Server Action: Error inserting article:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/"); // Revalidate home page for latest articles
  revalidatePath("/search"); // Revalidate search page
  revalidatePath("/current"); // Revalidate current issue page
  revalidatePath("/archives/[issueId]", 'page'); // Revalidate specific issue page
  return { data: data as Article, error: null };
}

export async function updateArticleAction(id: string, article: Partial<Omit<Article, 'id'>>): Promise<{ data: Article | null; error: string | null }> {
  const { data, error } = await supabaseAdmin
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
    console.error(`Server Action: Error updating article with ID ${id}:`, error);
    return { data: null, error: error.message };
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/articles/${id}`);
  revalidatePath("/"); // Revalidate home page for latest articles
  revalidatePath("/search"); // Revalidate search page
  revalidatePath("/current"); // Revalidate current issue page
  revalidatePath("/archives/[issueId]", 'page'); // Revalidate specific issue page
  return { data: data as Article, error: null };
}

export async function deleteArticleAction(id: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Server Action: Error deleting article with ID ${id}:`, error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/"); // Revalidate home page for latest articles
  revalidatePath("/search"); // Revalidate search page
  revalidatePath("/current"); // Revalidate current issue page
  revalidatePath("/archives/[issueId]", 'page'); // Revalidate specific issue page
  return { success: true, error: null };
}