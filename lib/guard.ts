import { verifyCsrf } from "@/lib/security";
import { requireRole, type AuthedUser } from "@/lib/rbac";

/**
 * Use at the top of every POST/PUT/PATCH/DELETE admin route:
 *
 *   const user = await guardMutation(req, "EDITOR");
 *
 * Checks CSRF first (cheap, no DB hit) then role (hits the session/JWT).
 * GET routes should use requireRole() directly — CSRF only applies to
 * state-changing requests.
 */
export async function guardMutation(
  req: Request,
  minRole: Parameters<typeof requireRole>[0]
): Promise<AuthedUser> {
  await verifyCsrf(req);
  return requireRole(minRole);
}
