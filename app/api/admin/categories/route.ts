import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, created, handleApiError } from "@/lib/api-response";
import { upsertCategorySchema } from "@/lib/validations/category";
import { sanitizePlainText } from "@/lib/security";
import { uniqueSlug } from "@/lib/slugify";

// GET /api/admin/categories — any authed role, used to populate the post
// editor's category picker and the categories management table.
export async function GET() {
  try {
    await requireRole("AUTHOR");

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });

    return ok(categories);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/categories — EDITOR and above can taxonomize content;
// Authors can create posts but shouldn't restructure the site's taxonomy.
export async function POST(req: Request) {
  try {
    await guardMutation(req, "EDITOR");
    const body = upsertCategorySchema.parse(await req.json());

    const name = sanitizePlainText(body.name);
    const slug = await uniqueSlug(body.slug ?? name, async (candidate) => {
      const existing = await prisma.category.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body.description ? sanitizePlainText(body.description) : null,
      },
    });

    return created(category);
  } catch (err) {
    return handleApiError(err);
  }
}
