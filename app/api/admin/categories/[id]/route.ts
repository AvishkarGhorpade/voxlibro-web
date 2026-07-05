import { prisma } from "@/lib/prisma";
import { guardMutation } from "@/lib/guard";
import { ok, noContent, handleApiError, ApiError } from "@/lib/api-response";
import { upsertCategorySchema } from "@/lib/validations/category";
import { sanitizePlainText } from "@/lib/security";
import { slugify } from "@/lib/slugify";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await guardMutation(req, "EDITOR");

    const body = upsertCategorySchema.partial().parse(await req.json());

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Category not found");

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: sanitizePlainText(body.name) } : {}),
        ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}),
        ...(body.description !== undefined
          ? { description: sanitizePlainText(body.description) }
          : {}),
      },
    });

    return ok(category);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE unlinks the category from its posts (schema uses onDelete: SetNull)
// rather than cascading — deleting a taxonomy term should never delete content.
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    // Deleting taxonomy is structural — require ADMIN, not just EDITOR.
    await guardMutation(req, "ADMIN");

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Category not found");

    await prisma.category.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
