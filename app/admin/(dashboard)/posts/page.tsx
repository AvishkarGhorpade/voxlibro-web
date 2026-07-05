"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, Trash2, Upload, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { adminApi, type AdminPost } from "@/lib/admin-api-client";

const STATUS_VARIANT: Record<AdminPost["status"], "secondary" | "outline"> = {
  DRAFT: "outline",
  PUBLISHED: "secondary",
  ARCHIVED: "outline",
};

export default function AdminPostsPage() {
  const [posts, setPosts] = React.useState<AdminPost[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await adminApi.listPosts({ page: 1 });
    if (res.ok && res.data) {
      setPosts(res.data.posts);
    } else {
      setError(res.error ?? "Failed to load posts.");
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handlePublishToggle(post: AdminPost) {
    setBusyId(post.id);
    const action = post.status === "PUBLISHED" ? "unpublish" : "publish";
    const res = await adminApi.setPostStatus(post.id, action);
    if (res.ok) await load();
    else setError(res.error ?? "Action failed.");
    setBusyId(null);
  }

  async function handleDelete(post: AdminPost) {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setBusyId(post.id);
    const res = await adminApi.deletePost(post.id);
    if (res.ok) await load();
    else setError(res.error ?? "Delete failed.");
    setBusyId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        {posts === null ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No posts yet — create your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="bg-background">
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">{post.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[post.status]}>{post.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(post.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {post.status === "PUBLISHED" && (
                        <Button variant="ghost" size="icon" asChild aria-label="View live">
                          <Link href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild aria-label="Edit">
                        <Link href={`/admin/posts/${post.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        disabled={busyId === post.id}
                        onClick={() => handlePublishToggle(post)}
                      >
                        {post.status === "PUBLISHED" ? (
                          <Undo2 className="h-4 w-4" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        disabled={busyId === post.id}
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
