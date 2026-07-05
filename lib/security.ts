import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import DOMPurify from "isomorphic-dompurify";
import { ApiError } from "@/lib/api-response";

const CSRF_COOKIE = "voxlibro.csrf_token";
const CSRF_HEADER = "x-csrf-token";

/**
 * Double-submit-cookie CSRF protection.
 * - GET /api/csrf sets an httpOnly=false cookie with a random token.
 * - The admin client reads that cookie and echoes it back in the
 *   `x-csrf-token` header on every mutating request (POST/PUT/PATCH/DELETE).
 * - We compare cookie vs header using a timing-safe check.
 * NextAuth session cookies remain httpOnly and are the real auth boundary;
 * this defends specifically against cross-site request forgery on top of
 * that session.
 */
export async function issueCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const store = await cookies();
  store.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS to echo back in header
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return token;
}

export async function verifyCsrf(req: Request): Promise<void> {
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) {
    throw new ApiError(403, "Missing CSRF token");
  }

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new ApiError(403, "Invalid CSRF token");
  }
}

/**
 * Strips characters/patterns that have no legitimate use in plain-text
 * fields (titles, names, slugs, excerpts) and are common XSS vectors.
 * This is defense-in-depth: the primary defense is that React escapes
 * output by default and we never use dangerouslySetInnerHTML on raw
 * user input.
 */
export function sanitizePlainText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "") // strip any HTML tags from plain-text fields
    .trim();
}

/**
 * Sanitizes the HTML produced by rendering a post's markdown, so that
 * even if an author pastes raw HTML/script tags into markdown content,
 * nothing executable reaches the browser. Uses an allowlist approach.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li",
      "blockquote", "code", "pre", "h1", "h2", "h3", "h4", "img",
      "table", "thead", "tbody", "tr", "th", "td", "hr",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
  });
}

export function hashIp(ip: string): string {
  // One-way hash so analytics never store a reversible identifier.
  return createHash("sha256").update(ip + (process.env.ANALYTICS_SALT ?? "")).digest("hex");
}
