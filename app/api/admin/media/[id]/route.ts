import { prisma } from "@/lib/prisma";
import { guardMutation } from "@/lib/guard";
import { isRoleAtLeast } from "@/lib/rbac";
import { ok, noContent, handleApiError, ApiError } from "@/lib/api-response";
import { deleteImage } from "@/lib/cloudinary";
import { sanitizePlainText } from "@/lib/security";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

const patchSchema = z.object({ altText: z.string().trim().max(200) });

// PATCH /api/admin/media/:id — edit alt text (accessibility + SEO metadata).
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await guardMutation(req, "AUTHOR");

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Media not found");
    if (existing.uploadedById !== user.id && !isRoleAtLeast(user.role, "EDITOR")) {
      throw new ApiError(403, "You can only edit media you uploaded");
    }

    const { altText } = patchSchema.parse(await req.json());
    const media = await prisma.media.update({
      where: { id },
      data: { altText: sanitizePlainText(altText) },
    });

    return ok(media);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/media/:id — removes from Cloudinary AND the DB.
// Media still referenced by a post has its coverImageId set to NULL
// automatically (schema: onDelete: SetNull), never blocking deletion.
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await guardMutation(req, "AUTHOR");

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Media not found");
    if (existing.uploadedById !== user.id && !isRoleAtLeast(user.role, "EDITOR")) {
      throw new ApiError(403, "You can only delete media you uploaded");
    }

    await deleteImage(existing.publicId);
    await prisma.media.delete({ where: { id } });

    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
