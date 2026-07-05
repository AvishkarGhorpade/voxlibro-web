import { ApiError } from "@/lib/api-response";

/**
 * Rate limiting strategy
 * ----------------------
 * In production (Vercel serverless, multiple instances) we need a shared
 * store, so we use Upstash Redis via @upstash/ratelimit when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are configured.
 *
 * Locally, or if Upstash isn't configured, we fall back to an in-memory
 * sliding window. This is per-instance only — fine for dev, not for
 * multi-instance production, which is why the env vars are required in
 * the deployment checklist (see .env.example).
 */

type Bucket = { count: number; resetAt: number };
const memoryStore = new Map<string, Bucket>();

function memoryLimiter(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

let upstashLimiter: {
  limit: (key: string) => Promise<{ success: boolean; remaining: number }>;
} | null = null;

async function getUpstashLimiter(limit: number, windowSeconds: number) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (upstashLimiter) return upstashLimiter;

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: "voxlibro:ratelimit",
  });

  return upstashLimiter;
}

export interface RateLimitOptions {
  /** Unique key for the caller, e.g. `login:${ip}` or `upload:${userId}` */
  key: string;
  /** Max requests allowed within the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

/**
 * Throws a 429 ApiError if the caller has exceeded their limit.
 * Call this at the top of sensitive routes: login, autosave, upload, search.
 */
export async function enforceRateLimit({ key, limit, windowSeconds }: RateLimitOptions) {
  const limiter = await getUpstashLimiter(limit, windowSeconds);

  if (limiter) {
    const result = await limiter.limit(key);
    if (!result.success) {
      throw new ApiError(429, "Too many requests. Please slow down and try again shortly.");
    }
    return;
  }

  const result = memoryLimiter(key, limit, windowSeconds * 1000);
  if (!result.success) {
    throw new ApiError(429, "Too many requests. Please slow down and try again shortly.");
  }
}

/** Extracts a best-effort client identifier for rate-limit keys. */
export function getClientIp(req: { headers: Pick<Headers, "get"> }): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return (forwardedFor.split(",")[0] ?? forwardedFor).trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
