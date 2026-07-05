import { issueCsrfToken } from "@/lib/security";
import { ok, handleApiError } from "@/lib/api-response";

/**
 * The admin dashboard calls this once on load to get a CSRF token cookie.
 * It then reads the cookie value client-side and sends it back in the
 * `x-csrf-token` header on every mutating admin request.
 */
export async function GET() {
  try {
    const token = await issueCsrfToken();
    return ok({ csrfToken: token });
  } catch (err) {
    return handleApiError(err);
  }
}
