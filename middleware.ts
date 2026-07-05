import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Runs on every request (edge runtime). Responsibilities:
 *  1. Attach hardened security headers to every response.
 *  2. Reject unauthenticated/under-privileged requests to /api/admin/*
 *     before they reach the route handler (belt-and-suspenders on top of
 *     requireRole() inside each handler, which still re-checks with a
 *     fresh DB-backed lookup where it matters, e.g. isActive).
 *
 * We intentionally use `getToken` (edge-safe, just decodes the JWT cookie)
 * rather than the full `auth()` helper from lib/auth.ts, because that file
 * wires in the Prisma adapter and Credentials provider's authorize(), which
 * depend on the Node.js Prisma client and cannot run in the edge runtime
 * middleware executes in.
 *
 * This does NOT touch any /app frontend page's rendering — it only adds
 * response headers and gates the admin API surface.
 */
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // --- Security headers -----------------------------------------------
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "0"); // modern browsers rely on CSP instead
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  const isDev = process.env.NODE_ENV === "development";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' https://res.cloudinary.com data:",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // --- Admin API gate ----------------------------------------------------
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.role) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401, headers: response.headers }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
