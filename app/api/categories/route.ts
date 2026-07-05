import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";

// GET /api/categories — public list, only categories with at least one
// published post (an empty/draft-only category shouldn't appear as a
// filter option on the public blog).
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { posts: { some: { status: "PUBLISHED" } } },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        description: true,
        _count: { select: { posts: { where: { status: "PUBLISHED" } } } },
      },
    });
    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}
