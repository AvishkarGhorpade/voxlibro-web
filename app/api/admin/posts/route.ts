import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, created, handleApiError } from "@/lib/api-response";
import { createPostSchema, listPostsQuerySchema } from "@/lib/validations/post";
import { sanitizePlainText } from "@/lib/security";
import { uniqueSlug, estimateReadingTimeMinutes } from "@/lib/slugify";
import { isRoleAtLeast } from "@/lib/rbac";

// GET /api/admin/posts — paginated list for the dashboard, any authed role.
// Authors only see their own posts; Editor and above see everything.
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole("AUTHOR");
    const query = listPostsQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );

    const where = {
      ...(isRoleAtLeast(user.role, "EDITOR") ? {} : { authorId: user.id }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.tag ? { tags: { some: { tag: { slug: query.tag } } } } : {}),
      ...(query.search
        ? { title: { contains: query.search, mode: "insensitive" as const } }
        : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
          category: true,
          tags: { include: { tag: true } },
          coverImage: true,
        },
        orderBy: { updatedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return ok({
      posts,
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

// POST /api/admin/posts — create a new draft post.
export async function POST(req: Request) {
  try {
    const user = await guardMutation(req, "AUTHOR");
    const body = createPostSchema.parse(await req.json());

    const title = sanitizePlainText(body.title);
    const excerpt = body.excerpt ? sanitizePlainText(body.excerpt) : null;

    const slug = await uniqueSlug(body.slug ?? title, async (candidate) => {
      const existing = await prisma.post.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    });

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content: body.content,
        readingTimeMinutes: estimateReadingTimeMinutes(body.content),
        authorId: user.id,
        categoryId: body.categoryId ?? null,
        coverImageId: body.coverImageId ?? null,
        tags: body.tagIds?.length
          ? { create: body.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return created(post);
  } catch (err) {
    return handleApiError(err);
  }
}
