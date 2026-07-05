import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, isRoleAtLeast } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { ok, noContent, handleApiError, ApiError } from "@/lib/api-response";
import { updatePostSchema } from "@/lib/validations/post";
import { sanitizePlainText } from "@/lib/security";
import { slugify, estimateReadingTimeMinutes } from "@/lib/slugify";

interface Params {
  params: Promise<{ id: string }>;
}

async function getOwnedPost(id: string, userId: string, minRoleForAny: boolean) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new ApiError(404, "Post not found");
  if (!minRoleForAny && post.authorId !== userId) {
    throw new ApiError(403, "You can only manage your own posts");
  }
  return post;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireRole("AUTHOR");
    await getOwnedPost(id, user.id, isRoleAtLeast(user.role, "EDITOR"));

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: { include: { tag: true } },
        coverImage: true,
        revisions: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    return ok(post);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const user = await guardMutation(req, "AUTHOR");
    await getOwnedPost(id, user.id, isRoleAtLeast(user.role, "EDITOR"));

    const body = updatePostSchema.parse(await req.json());

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = sanitizePlainText(body.title);
    if (body.excerpt !== undefined) data.excerpt = sanitizePlainText(body.excerpt);
    if (body.content !== undefined) {
      data.content = body.content;
      data.readingTimeMinutes = estimateReadingTimeMinutes(body.content);
    }
    if (body.slug !== undefined) data.slug = slugify(body.slug);
    if (body.categoryId !== undefined) data.categoryId = body.categoryId;
    if (body.coverImageId !== undefined) data.coverImageId = body.coverImageId;

    const post = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (body.tagIds !== undefined) {
        await tx.postTag.deleteMany({ where: { postId: id } });
        if (body.tagIds.length) {
          await tx.postTag.createMany({
            data: body.tagIds.map((tagId) => ({ postId: id, tagId })),
          });
        }
      }
      return tx.post.update({
        where: { id },
        data,
        include: { category: true, tags: { include: { tag: true } } },
      });
    });

    return ok(post);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    // Deleting is more destructive than editing — require EDITOR+ even for
    // an author's own post, and full ADMIN to delete someone else's.
    const user = await guardMutation(req, "EDITOR");
    const post = await getOwnedPost(id, user.id, isRoleAtLeast(user.role, "ADMIN"));

    await prisma.post.delete({ where: { id: post.id } });
    return noContent();
  } catch (err) {
    return handleApiError(err);
  }
}
