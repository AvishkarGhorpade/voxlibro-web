import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ok, handleApiError } from "@/lib/api-response";

// GET /api/admin/analytics — powers the dashboard's overview cards,
// top-posts table, and recent-searches panel. EDITOR+ only: authors see
// their own post stats via /api/admin/posts, not sitewide analytics.
export async function GET() {
  try {
    await requireRole("EDITOR");

    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      viewsLast30d,
      topPosts,
      recentSearches,
      postsByCategory,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.aggregate({ _sum: { viewCount: true } }),
      prisma.analyticsEvent.count({
        where: { type: "POST_VIEW", createdAt: { gte: since30d } },
      }),
      prisma.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true, publishedAt: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { type: "SEARCH", createdAt: { gte: since30d } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { query: true, createdAt: true },
      }),
      prisma.category.findMany({
        select: { name: true, slug: true, _count: { select: { posts: true } } },
        orderBy: { posts: { _count: "desc" } },
      }),
    ]);

    return ok({
      overview: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: totalViews._sum.viewCount ?? 0,
        viewsLast30d,
      },
      topPosts,
      recentSearches,
      postsByCategory,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
