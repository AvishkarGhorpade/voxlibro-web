import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { created, handleApiError } from "@/lib/api-response";
import { contactMessageSchema } from "@/lib/validations/public";
import { sanitizePlainText, hashIp } from "@/lib/security";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/contact — public contact form submission. Validated, rate
// limited, and persisted so the developer can review messages directly in
// the database (no third-party email service required to ship this).
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await enforceRateLimit({ key: `contact:${ip}`, limit: 5, windowSeconds: 300 });

    const body = await req.json();
    const parsed = contactMessageSchema.parse(body);

    const message = await prisma.contactMessage.create({
      data: {
        name: sanitizePlainText(parsed.name),
        email: parsed.email,
        subject: sanitizePlainText(parsed.subject),
        message: sanitizePlainText(parsed.message),
        ipHash: hashIp(ip),
      },
      select: { id: true },
    });

    return created({ id: message.id });
  } catch (err) {
    return handleApiError(err);
  }
}
