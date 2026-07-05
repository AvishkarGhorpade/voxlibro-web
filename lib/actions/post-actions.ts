"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, isRoleAtLeast } from "@/lib/rbac";
import { sanitizePlainText } from "@/lib/security";
import { estimateReadingTimeMinutes, uniqueSlug } from "@/lib/slugify";
import { createPostSchema } from "@/lib/validations/post";

/**
 * Server Actions for the admin dashboard's post editor.
 *
 * These wrap the same Prisma calls as the REST routes under
 * app/api/admin/posts, but are callable directly from a <form action={...}>
 * or a Client Component without a manual fetch — Next.js handles the
 * request/response and CSRF-equivalent origin checking for Server Actions
 * automatically. The REST routes remain the integration surface for any
 * non-Next.js client (mobile app, external tool).
 *
 * Every action re-checks the session role itself — never trust that a
 * Server Action was only reachable from an already-gated page.
 */

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createPostAction(formData: FormData): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await requireRole("AUTHOR");

    const raw = {
      title: String(formData.get("title") ?? ""),
      excerpt: formData.get("excerpt") ? String(formData.get("excerpt")) : undefined,
      content: String(formData.get("content") ?? ""),
      categoryId: formData.get("categoryId") ? String(formData.get("categoryId")) : undefined,
    };

    const parsed = createPostSchema.parse(raw);
    const title = sanitizePlainText(parsed.title);

    const slug = await uniqueSlug(title, async (candidate) => {
      const existing = await prisma.post.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: parsed.excerpt ? sanitizePlainText(parsed.excerpt) : null,
        content: parsed.content,
        readingTimeMinutes: estimateReadingTimeMinutes(parsed.content),
        authorId: user.id,
        categoryId: parsed.categoryId ?? null,
      },
    });

    revalidatePath("/admin/posts");
    return { success: true, data: { id: post.id, slug: post.slug } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create post" };
  }
}

export async function togglePostStatusAction(
  postId: string,
  action: "publish" | "unpublish" | "archive"
): Promise<ActionResult<{ status: string }>> {
  try {
    const user = await requireRole("EDITOR");
    void user;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, error: "Post not found" };

    const statusMap = { publish: "PUBLISHED", unpublish: "DRAFT", archive: "ARCHIVED" } as const;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        status: statusMap[action],
        publishedAt: action === "publish" ? post.publishedAt ?? new Date() : post.publishedAt,
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/blog");

    return { success: true, data: { status: updated.status } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update status" };
  }
}

export async function deletePostAction(postId: string): Promise<ActionResult<null>> {
  try {
    const user = await requireRole("EDITOR");
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { success: false, error: "Post not found" };

    if (post.authorId !== user.id && !isRoleAtLeast(user.role, "ADMIN")) {
      return { success: false, error: "You can only delete your own posts" };
    }

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/admin/posts");
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete post" };
  }
}
