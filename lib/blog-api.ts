import { siteConfig } from "@/config/site";
import type { BlogPostDetail, BlogPostSummary, Pagination } from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${siteConfig.url}${path}`, {
    // Blog content changes infrequently; revalidate periodically instead
    // of on every request so the marketing site isn't hammering the DB.
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json.success || json.data === undefined) return null;
  return json.data;
}

export async function getPublishedPosts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}): Promise<{ posts: BlogPostSummary[]; pagination: Pagination }> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.category) search.set("category", params.category);
  if (params?.tag) search.set("tag", params.tag);

  const data = await apiGet<{ posts: BlogPostSummary[]; pagination: Pagination }>(
    `/api/posts${search.toString() ? `?${search.toString()}` : ""}`
  );
  return data ?? { posts: [], pagination: { page: 1, pageSize: 0, total: 0, totalPages: 0 } };
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  return apiGet<BlogPostDetail>(`/api/posts/${encodeURIComponent(slug)}`);
}

export async function searchPosts(
  query: string,
  page = 1
): Promise<{ results: BlogPostSummary[]; pagination: Pagination }> {
  if (!query.trim()) {
    return { results: [], pagination: { page: 1, pageSize: 0, total: 0, totalPages: 0 } };
  }
  const search = new URLSearchParams({ q: query, page: String(page) });
  const data = await apiGet<{ results: BlogPostSummary[]; pagination: Pagination }>(
    `/api/search?${search.toString()}`
  );
  return data ?? { results: [], pagination: { page: 1, pageSize: 0, total: 0, totalPages: 0 } };
}
