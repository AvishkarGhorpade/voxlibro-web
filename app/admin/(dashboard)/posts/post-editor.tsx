"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Upload, Undo2, Trash2, Eye, Pencil as PencilIcon, ImagePlus, X, Link2 } from "lucide-react";
import { marked } from "marked";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  adminApi,
  type AdminCategory,
  type AdminTag,
  type AdminPost,
} from "@/lib/admin-api-client";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // matches lib/validations/media.ts

interface PostEditorProps {
  post?: AdminPost;
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const isNew = !post;

  const [title, setTitle] = React.useState(post?.title ?? "");
  const [excerpt, setExcerpt] = React.useState(post?.excerpt ?? "");
  const [content, setContent] = React.useState(post?.content ?? "");
  const [categoryId, setCategoryId] = React.useState(post?.category?.id ?? "");
  const [tagIds, setTagIds] = React.useState<string[]>(post?.tags.map((t) => t.tag.id) ?? []);
  const [categories, setCategories] = React.useState<AdminCategory[]>([]);
  const [tags, setTags] = React.useState<AdminTag[]>([]);
  const [tab, setTab] = React.useState<"write" | "preview">("write");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [postId, setPostId] = React.useState<string | undefined>(post?.id);
  const [status, setStatus] = React.useState(post?.status ?? "DRAFT");
  const [coverImageId, setCoverImageId] = React.useState<string | null>(post?.coverImageId ?? null);
  const [coverImageUrl, setCoverImageUrl] = React.useState<string | null>(
    post?.coverImage?.secureUrl ?? null
  );
  const [imageUrlInput, setImageUrlInput] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    adminApi.listCategories().then((res) => res.ok && res.data && setCategories(res.data));
    adminApi.listTags().then((res) => res.ok && res.data && setTags(res.data));
  }, []);

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("That image is over the 8MB upload limit.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await adminApi.uploadMedia(dataUrl, title || undefined);
      if (res.ok && res.data) {
        setCoverImageId(res.data.id);
        setCoverImageUrl(res.data.secureUrl);
      } else {
        setError(res.error ?? "Upload failed.");
      }
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleUseImageUrl() {
    if (!imageUrlInput.trim().startsWith("https://")) {
      setError("Image URL must start with https://");
      return;
    }
    setError(null);
    setUploading(true);
    const res = await adminApi.uploadMedia(imageUrlInput.trim(), title || undefined);
    setUploading(false);
    if (res.ok && res.data) {
      setCoverImageId(res.data.id);
      setCoverImageUrl(res.data.secureUrl);
      setImageUrlInput("");
    } else {
      setError(res.error ?? "Couldn't use that image URL.");
    }
  }

  function handleRemoveCoverImage() {
    setCoverImageId(null);
    setCoverImageUrl(null);
  }

  async function handleSave() {
    setError(null);
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    setSaving(true);
    const body = {
      title,
      excerpt: excerpt || undefined,
      content,
      categoryId: categoryId || null,
      tagIds,
      coverImageId,
    };

    const res = postId
      ? await adminApi.updatePost(postId, body)
      : await adminApi.createPost(body);

    setSaving(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? "Save failed.");
      return;
    }
    if (isNew) {
      router.replace(`/admin/posts/${res.data.id}`);
    }
    setPostId(res.data.id);
  }

  async function handlePublishToggle() {
    if (!postId) {
      setError("Save the post before publishing.");
      return;
    }
    setSaving(true);
    const action = status === "PUBLISHED" ? "unpublish" : "publish";
    const res = await adminApi.setPostStatus(postId, action);
    setSaving(false);
    if (res.ok && res.data) {
      setStatus(res.data.status);
    } else {
      setError(res.error ?? "Action failed.");
    }
  }

  async function handleDelete() {
    if (!postId) {
      router.push("/admin/posts");
      return;
    }
    if (!confirm("Delete this post? This can't be undone.")) return;
    const res = await adminApi.deletePost(postId);
    if (res.ok) router.push("/admin/posts");
    else setError(res.error ?? "Delete failed.");
  }

  const previewHtml = React.useMemo(
    () => (tab === "preview" ? (marked.parse(content, { async: false }) as string) : ""),
    [tab, content]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">
          {isNew ? "New post" : "Edit post"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          <Button onClick={handlePublishToggle} disabled={saving || isNew}>
            {status === "PUBLISHED" ? <Undo2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </Button>
          {!isNew && (
            <Button variant="ghost" size="icon" aria-label="Delete post" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One or two sentence summary"
              maxLength={400}
              className="min-h-[70px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content (Markdown)</Label>
              <div className="flex overflow-hidden rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setTab("write")}
                  className={`flex items-center gap-1 px-3 py-1.5 ${tab === "write" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                >
                  <PencilIcon className="h-3 w-3" /> Write
                </button>
                <button
                  type="button"
                  onClick={() => setTab("preview")}
                  className={`flex items-center gap-1 px-3 py-1.5 ${tab === "preview" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
              </div>
            </div>
            <div className="mt-2">
              {tab === "write" ? (
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post in Markdown…"
                  className="min-h-[420px] font-mono text-sm"
                />
              ) : (
                <div
                  className="prose-voxlibro min-h-[420px] rounded-lg border border-border bg-card p-5"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <Label>Cover image</Label>
            <div className="mt-2">
              {coverImageUrl ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <Image
                    src={coverImageUrl}
                    alt=""
                    width={400}
                    height={225}
                    className="aspect-video w-full object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    aria-label="Remove cover image"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload image"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="or paste an image URL"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={uploading || !imageUrlInput.trim()}
                      onClick={handleUseImageUrl}
                      aria-label="Use image URL"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WebP, up to 8MB.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">No tags yet.</p>
              )}
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    tagIds.includes(tag.id)
                      ? "border-accent bg-accent-muted text-accent"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {!isNew && (
            <p className="text-xs text-muted-foreground">
              Status: <span className="font-medium text-foreground">{status}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
