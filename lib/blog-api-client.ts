"use client";

import type { BlogPostSummary } from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Client-side (browser fetch, relative URL) search against /api/search. */
export async function searchPosts(query: string, signal?: AbortSignal): Promise<BlogPostSummary[]> {
  const search = new URLSearchParams({ q: query });
  const res = await fetch(`/api/search?${search.toString()}`, { signal });
  if (!res.ok) return [];
  const json = (await res.json()) as ApiEnvelope<{ results: BlogPostSummary[] }>;
  if (!json.success || !json.data) return [];
  return json.data.results;
}
