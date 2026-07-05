import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";
import { ok, handleApiError } from "@/lib/api-response";
import { trackEventSchema } from "@/lib/validations/analytics";
import { hashIp } from "@/lib/security";

// POST /api/analytics/track — public, called from the frontend (a small
// client-side beacon) on page views. No auth: anyone can view the public
// site, so this must work anonymously. We rate-limit per-IP instead to
// stop it being abused as a write-amplification vector, and we never
// store the raw IP — only a salted one-way hash, purely to let the
// dashboard estimate unique visitors without tracking individuals.
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    await enforceRateLimit({ key: `analytics:${ip}`, limit: 60, windowSeconds: 60 });

    const body = trackEventSchema.parse(await req.json());

    await prisma.analyticsEvent.create({
      data: {
        type: body.type,
        path: body.path,
        postId: body.postId,
        query: body.query,
        referrer: req.headers.get("referer") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipHash: hashIp(ip),
      },
    });

    // Fire-and-forget from the client's perspective — keep the payload tiny.
    return ok({ tracked: true });
  } catch (err) {
    return handleApiError(err);
  }
}
