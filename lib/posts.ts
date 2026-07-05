import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { renderMarkdownToSafeHtml } from "@/lib/markdown";
import { hashIp } from "@/lib/security";
import { getClientIp, enforceRateLimit } from "@/lib/rate-limit";

const postSummarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  readingTimeMinutes: true,
  publishedAt: true,
  viewCount: true,
  author: { select: { name: true, image: true } },
  category: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
  coverImage: { select: { secureUrl: true, altText: true } },
} as const;

/**
 * Shared with app/api/posts/route.ts. Server Components (the /blog page)
 * call this directly instead of `fetch()`-ing our own API route over
 * HTTP — self-fetching an app's own API from its own server component is
 * an unreliable anti-pattern (it depends on the app's public URL being
 * reachable from itself, which breaks in local dev, cold starts, and
 * some hosts) and was the cause of the "fetch failed" error on /blog/[slug].
 */
export async function listPublishedPosts(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 10));

  const where = {
    status: "PUBLISHED" as const,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.tag ? { tags: { some: { tag: { slug: params.tag } } } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: postSummarySelect,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString() ?? null,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

/** Shared with app/api/posts/[slug]/route.ts — see listPublishedPosts note above. */
export async function getPublishedPostBySlug(slug: string) {
  const reqHeaders = await headers();
  const ip = getClientIp({ headers: reqHeaders });

  // Same anti-refresh-spam guard the API route uses; swallow rate-limit
  // errors here (view count just won't increment) rather than 500-ing an
  // entire page render over what's a soft, non-critical limit.
  let shouldCountView = true;
  try {
    await enforceRateLimit({ key: `postview:${ip}:${slug}`, limit: 5, windowSeconds: 60 });
  } catch {
    shouldCountView = false;
  }

  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      coverImage: { select: { secureUrl: true, altText: true } },
    },
  });

  if (!post) return null;

  if (shouldCountView) {
    await Promise.all([
      prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }),
      prisma.analyticsEvent.create({
        data: {
          type: "POST_VIEW",
          postId: post.id,
          path: `/blog/${post.slug}`,
          referrer: reqHeaders.get("referer") ?? undefined,
          userAgent: reqHeaders.get("user-agent") ?? undefined,
          ipHash: hashIp(ip),
        },
      }),
    ]);
  }

  return {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    contentHtml: renderMarkdownToSafeHtml(post.content),
  };
}
