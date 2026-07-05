import { prisma } from "@/lib/prisma";
import { guardMutation } from "@/lib/guard";
import { ok, noContent, handleApiError, ApiError } from "@/lib/api-response";
import { upsertTagSchema } from "@/lib/validations/tag";
import { sanitizePlainText } from "@/lib/security";
import { slugify } from "@/lib/slugify";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await guardMutation(req, "EDITOR");
    const body = upsertTagSchema.partial().parse(await req.json());

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Tag not found");

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: sanitizePlainText(body.name) } : {}),
        ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}),
      },
    });

    return ok(tag);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await guardMutation(req, "EDITOR");

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Tag not found");

    await prisma.tag.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
