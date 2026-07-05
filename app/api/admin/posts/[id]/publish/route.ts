import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guardMutation } from "@/lib/guard";
import { ok, handleApiError, ApiError } from "@/lib/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  action: z.enum(["publish", "unpublish", "archive"]),
});

// PATCH /api/admin/posts/:id/publish
// Only EDITOR and above may publish — authors can write but not ship,
// matching the standard editorial-review workflow.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await guardMutation(req, "EDITOR");

    const { action } = bodySchema.parse(await req.json());

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new ApiError(404, "Post not found");

    if (action === "publish" && !post.title.trim()) {
      throw new ApiError(422, "Cannot publish a post without a title");
    }

    const statusMap = {
      publish: "PUBLISHED",
      unpublish: "DRAFT",
      archive: "ARCHIVED",
    } as const;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        status: statusMap[action],
        publishedAt:
          action === "publish"
            ? post.publishedAt ?? new Date() // preserve original publish date on republish
            : post.publishedAt,
      },
    });

    return ok(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
