import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, created, handleApiError } from "@/lib/api-response";
import { upsertTagSchema } from "@/lib/validations/tag";
import { sanitizePlainText } from "@/lib/security";
import { uniqueSlug } from "@/lib/slugify";

export async function GET() {
  try {
    await requireRole("AUTHOR");
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return ok(tags);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST — any Author may create a tag inline while writing (mirrors the
// low-friction tagging UX of most CMSes); tags are cheap and reversible.
export async function POST(req: Request) {
  try {
    await guardMutation(req, "AUTHOR");
    const body = upsertTagSchema.parse(await req.json());

    const name = sanitizePlainText(body.name);
    const slug = await uniqueSlug(body.slug ?? name, async (candidate) => {
      const existing = await prisma.tag.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const tag = await prisma.tag.create({ data: { name, slug } });
    return created(tag);
  } catch (err) {
    return handleApiError(err);
  }
}
