import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, created, handleApiError, ApiError } from "@/lib/api-response";
import { inviteUserSchema } from "@/lib/validations/user";

// GET /api/admin/users — team management table. ADMIN+ only: authors and
// editors shouldn't see the full roster or other people's account state.
export async function GET() {
  try {
    await requireRole("ADMIN");

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
    });

    return ok(users);
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/admin/users — invite/create a teammate with a temporary
// password. Only SUPER_ADMIN may create accounts, and only SUPER_ADMIN
// may grant the ADMIN role, preventing privilege self-escalation chains.
export async function POST(req: Request) {
  try {
    const actor = await guardMutation(req, "SUPER_ADMIN");
    const body = inviteUserSchema.parse(await req.json());

    if (body.role === "ADMIN" && actor.role !== "SUPER_ADMIN") {
      throw new ApiError(403, "Only a Super Admin can grant the Admin role");
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    return created(user);
  } catch (err) {
    return handleApiError(err);
  }
}
