"use server";

import { getAllIssues, Issue } from "@/lib/issues";

export async function getIssuesForArticleForm(): Promise<Issue[]> {
  const issues = await getAllIssues();
  return issues;
}