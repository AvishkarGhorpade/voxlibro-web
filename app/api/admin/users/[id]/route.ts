import { prisma } from "@/lib/prisma";
import { guardMutation } from "@/lib/guard";
import { ok, noContent, handleApiError, ApiError } from "@/lib/api-response";
import { updateUserSchema } from "@/lib/validations/user";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/users/:id — change role or suspend (isActive: false)
// an account. SUPER_ADMIN only, and it can never demote/deactivate itself
// via this endpoint, so there is always at least one active super admin.
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await guardMutation(req, "SUPER_ADMIN");

    if (id === actor.id) {
      throw new ApiError(400, "You cannot change your own role or active status here");
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new ApiError(404, "User not found");

    const body = updateUserSchema.parse(await req.json());

    const user = await prisma.user.update({
      where: { id },
      data: body,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return ok(user);
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/users/:id — SUPER_ADMIN only, cannot delete self so
// there is always at least one super admin left to manage the system.
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const actor = await guardMutation(req, "SUPER_ADMIN");

    if (id === actor.id) {
      throw new ApiError(400, "You cannot delete your own account");
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new ApiError(404, "User not found");

    await prisma.user.delete({ where: { id } });
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
