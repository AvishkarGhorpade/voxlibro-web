import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";

// GET /api/tags — public list, same "only if attached to a published
// post" filtering rationale as /api/categories.
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      where: { posts: { some: { post: { status: "PUBLISHED" } } } },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { posts: { where: { post: { status: "PUBLISHED" } } } } },
      },
    });
    return ok(tags);
  } catch (err) {
    return handleApiError(err);
  }
}
