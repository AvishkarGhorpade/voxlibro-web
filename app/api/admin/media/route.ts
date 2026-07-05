import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { guardMutation } from "@/lib/guard";
import { enforceRateLimit } from "@/lib/rate-limit";
import { ok, created, handleApiError, ApiError } from "@/lib/api-response";
import { uploadMediaSchema, MAX_UPLOAD_BYTES } from "@/lib/validations/media";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

// GET /api/admin/media — paginated library, newest first, for the media
// picker modal in the post editor and the standalone media manager page.
export async function GET(req: NextRequest) {
  try {
    await requireRole("AUTHOR");
    const query = listQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { uploadedBy: { select: { id: true, name: true } } },
      }),
      prisma.media.count(),
    ]);

    return ok({
      media,
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

// POST /api/admin/media — accepts a base64 data URI (or a remote https
// URL) and a friendly filename hint, uploads it to Cloudinary with
// automatic format/quality optimization, then persists the resulting
// asset metadata so it's browsable in the library and attachable to posts.
export async function POST(req: Request) {
  try {
    const user = await guardMutation(req, "AUTHOR");

    // Uploads are expensive (network + storage) — throttle per user.
    await enforceRateLimit({ key: `upload:${user.id}`, limit: 30, windowSeconds: 60 });

    const body = uploadMediaSchema.parse(await req.json());

    // Rough client-side-declared size check for base64 payloads; Cloudinary
    // enforces the real limit server-side regardless, this just fails fast
    // and cheaply before we make an outbound request.
    if (body.file.startsWith("data:")) {
      const base64Part = body.file.split(",")[1] ?? "";
      const approxBytes = Math.ceil((base64Part.length * 3) / 4);
      if (approxBytes > MAX_UPLOAD_BYTES) {
        throw new ApiError(413, "Image exceeds the 8MB upload limit");
      }
    }

    const uploadResult = await uploadImage(body.file, { folder: body.folder });

    const media = await prisma.media.create({
      data: {
        publicId: uploadResult.public_id,
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        altText: body.altText,
        folder: body.folder ?? "voxlibro/uploads",
        uploadedById: user.id,
      },
    });

    return created(media);
  } catch (err) {
    return handleApiError(err);
  }
}
