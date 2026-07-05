import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-response";

/** Higher number = more privilege. */
const ROLE_RANK: Record<string, number> = {
  AUTHOR: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export interface AuthedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Verifies the request has a valid admin session with at least `minRole`
 * privilege. Throws an ApiError (caught by the route's try/catch) if not.
 * Every admin route should call this before touching the database.
 */
export async function requireRole(minRole: keyof typeof ROLE_RANK): Promise<AuthedUser> {
  const session = await auth();

  if (!session?.user) {
    throw new ApiError(401, "Authentication required");
  }

  const userRank = ROLE_RANK[session.user.role] ?? 0;
  const requiredRank = ROLE_RANK[minRole] ?? Number.POSITIVE_INFINITY;

  if (userRank < requiredRank) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    role: session.user.role,
  };
}

export function isRoleAtLeast(role: string, minRole: keyof typeof ROLE_RANK): boolean {
  const requiredRank = ROLE_RANK[minRole] ?? Number.POSITIVE_INFINITY;
  return (ROLE_RANK[role] ?? 0) >= requiredRank;
}
