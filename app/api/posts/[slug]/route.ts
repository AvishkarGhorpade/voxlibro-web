import { ok, handleApiError, ApiError } from "@/lib/api-response";
import { getPublishedPostBySlug } from "@/lib/posts";

interface Params {
  params: Promise<{ slug: string }>;
}

// GET /api/posts/:slug — public article view, used by client-side callers
// (e.g. search result previews). The /blog/[slug] page itself calls
// getPublishedPostBySlug() directly (see lib/posts.ts) rather than
// fetching this over HTTP.
export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const post = await getPublishedPostBySlug(slug);
    if (!post) throw new ApiError(404, "Post not found");
    return ok(post);
  } catch (err) {
    return handleApiError(err);
  }
}
