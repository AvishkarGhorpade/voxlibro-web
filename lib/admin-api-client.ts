"use client";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)voxlibro\.csrf_token=([^;]+)/);
  const value = match?.[1];
  return value ? decodeURIComponent(value) : null;
}

/** Call once on mount in any admin page that will perform a mutation. */
export async function ensureCsrfToken(): Promise<string> {
  const existing = readCsrfCookie();
  if (existing) return existing;
  await fetch("/api/csrf");
  return readCsrfCookie() ?? "";
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const isMutation = init.method && init.method !== "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (isMutation) {
    headers["x-csrf-token"] = await ensureCsrfToken();
  }

  const res = await fetch(path, { ...init, headers });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !json?.success) {
    return { ok: false, error: json?.error ?? `Request failed (${res.status})` };
  }
  return { ok: true, data: json.data };
}

export const adminApi = {
  listPosts: (params: { page?: number; status?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.status) qs.set("status", params.status);
    return request<{
      posts: AdminPost[];
      pagination: { page: number; pageSize: number; total: number; totalPages: number };
    }>(`/api/admin/posts${qs.toString() ? `?${qs}` : ""}`);
  },
  getPost: (id: string) => request<AdminPost>(`/api/admin/posts/${id}`),
  createPost: (body: Partial<AdminPostInput>) =>
    request<AdminPost>("/api/admin/posts", { method: "POST", body: JSON.stringify(body) }),
  updatePost: (id: string, body: Partial<AdminPostInput>) =>
    request<AdminPost>(`/api/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePost: (id: string) => request<null>(`/api/admin/posts/${id}`, { method: "DELETE" }),
  setPostStatus: (id: string, action: "publish" | "unpublish" | "archive") =>
    request<AdminPost>(`/api/admin/posts/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }),
  listCategories: () => request<AdminCategory[]>("/api/admin/categories"),
  listTags: () => request<AdminTag[]>("/api/admin/tags"),
  uploadMedia: (file: string, altText?: string) =>
    request<AdminMedia>("/api/admin/media", {
      method: "POST",
      body: JSON.stringify({ file, altText, folder: "voxlibro/blog" }),
    }),
};

export interface AdminMedia {
  id: string;
  secureUrl: string;
  altText: string | null;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
}

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
  publishedAt: string | null;
  author: { id: string; name: string | null; email: string };
  category: AdminCategory | null;
  tags: { tag: AdminTag }[];
  coverImageId?: string | null;
  coverImage?: AdminMedia | null;
}

export interface AdminPostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  categoryId?: string | null;
  tagIds?: string[];
  coverImageId?: string | null;
}
