import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api-response";
import { searchQuerySchema } from "@/lib/validations/public";
import { sanitizePlainText, hashIp } from "@/lib/security";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/search?q=... — public full-text-ish search across published
// posts (title, excerpt, content). Uses Postgres ILIKE via Prisma's
// `contains`/`insensitive` mode, which is parameterized by Prisma under
// the hood — never string-concatenated SQL, so this is not vulnerable to
// SQL injection regardless of what a visitor types in `q`.
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await enforceRateLimit({ key: `search:${ip}`, limit: 30, windowSeconds: 60 });

    const query = searchQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const q = sanitizePlainText(query.q);

    const where = {
      status: "PUBLISHED" as const,
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { excerpt: { contains: q, mode: "insensitive" as const } },
        { content: { contains: q, mode: "insensitive" as const } },
      ],
    };

    const [results, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          slug: true,
          title: true,
          excerpt: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
          coverImage: { select: { secureUrl: true, altText: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Logged for the admin dashboard's "recent searches" panel — helps
    // editors see what readers are looking for but can't find.
    await prisma.analyticsEvent.create({
      data: {
        type: "SEARCH",
        query: q,
        ipHash: hashIp(ip),
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return ok({
      results,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
