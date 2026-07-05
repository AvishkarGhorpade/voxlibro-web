import { prisma } from "@/lib/prisma";
import { isRoleAtLeast } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ok, handleApiError, ApiError } from "@/lib/api-response";
import { autosavePostSchema } from "@/lib/validations/post";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/posts/:id/autosave
// Called on a debounced interval (e.g. every 5-10s) from the editor.
// Writes both a lightweight revision row AND updates the live draft
// fields on the Post itself, so a browser refresh shows the latest
// content without needing to restore a revision explicitly.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await guardMutation(req, "AUTHOR");

    // Autosave fires frequently — cap it to prevent runaway loops or a
    // compromised client hammering the DB.
    await enforceRateLimit({ key: `autosave:${user.id}`, limit: 20, windowSeconds: 60 });

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found");
    if (post.authorId !== user.id && !isRoleAtLeast(user.role, "EDITOR")) {
      throw new ApiError(403, "You can only autosave your own posts");
    }

    const body = autosavePostSchema.parse(await req.json());

    const [, revision] = await prisma.$transaction([
      prisma.post.update({
        where: { id },
        data: {
          title: body.title || post.title,
          excerpt: body.excerpt ?? post.excerpt,
          content: body.content || post.content,
        },
      }),
      prisma.postRevision.create({
        data: {
          postId: id,
          title: body.title || post.title,
          excerpt: body.excerpt ?? post.excerpt,
          content: body.content || post.content,
          isAutosave: true,
          createdById: user.id,
        },
      }),
    ]);

    return ok({ savedAt: revision.createdAt });
  } catch (err) {
    return handleApiError(err);
  }
}
