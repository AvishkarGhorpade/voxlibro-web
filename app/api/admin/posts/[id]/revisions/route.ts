import { prisma } from "@/lib/prisma";
import { requireRole, isRoleAtLeast } from "@/lib/rbac";
import { ok, handleApiError, ApiError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/admin/posts/:id/revisions — history panel in the editor.
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireRole("AUTHOR");

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found");
    if (post.authorId !== user.id && !isRoleAtLeast(user.role, "EDITOR")) {
      throw new ApiError(403, "You can only view revisions of your own posts");
    }

    const revisions = await prisma.postRevision.findMany({
      where: { postId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { createdBy: { select: { name: true } } },
    });

    return ok(revisions);
  } catch (err) {
    return handleApiError(err);
  }
}
