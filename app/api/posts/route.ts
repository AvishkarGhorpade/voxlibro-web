import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api-response";
import { publicPostsQuerySchema } from "@/lib/validations/public";
import { listPublishedPosts } from "@/lib/posts";

// GET /api/posts — public, paginated, PUBLISHED-only listing. Used by the
// client-side search page; the /blog page itself calls listPublishedPosts()
// directly (see lib/posts.ts) rather than fetching this over HTTP.
export async function GET(req: NextRequest) {
  try {
    const query = publicPostsQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const data = await listPublishedPosts(query);
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
