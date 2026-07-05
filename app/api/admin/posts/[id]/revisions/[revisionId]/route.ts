import { prisma } from "@/lib/prisma";
import { isRoleAtLeast } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, handleApiError, ApiError } from "@/lib/api-response";
import { estimateReadingTimeMinutes } from "@/lib/slugify";

interface Params {
  params: Promise<{ id: string; revisionId: string }>;
}

// POST /api/admin/posts/:id/revisions/:revisionId — restore a snapshot
// onto the live post. Writes a fresh (non-autosave) revision first so the
// pre-restore state is itself recoverable — restoring is never destructive.
export async function POST(req: Request, { params }: Params) {
  try {
    const { id, revisionId } = await params;
    const user = await guardMutation(req, "AUTHOR");

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found");
    if (post.authorId !== user.id && !isRoleAtLeast(user.role, "EDITOR")) {
      throw new ApiError(403, "You can only restore revisions of your own posts");
    }

    const revision = await prisma.postRevision.findUnique({ where: { id: revisionId } });
    if (!revision || revision.postId !== id) {
      throw new ApiError(404, "Revision not found");
    }

    const [, updated] = await prisma.$transaction([
      prisma.postRevision.create({
        data: {
          postId: id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          isAutosave: false,
          createdById: user.id,
        },
      }),
      prisma.post.update({
        where: { id },
        data: {
          title: revision.title,
          excerpt: revision.excerpt,
          content: revision.content,
          readingTimeMinutes: estimateReadingTimeMinutes(revision.content),
        },
      }),
    ]);

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
