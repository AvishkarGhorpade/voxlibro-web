import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ success: true, data }, { status: init ?? 200 });
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Central error handler for route handlers. Wrap the body of every
 * API route in try { ... } catch (err) { return handleApiError(err); }
 * so error shape and status codes stay consistent, and so we never leak
 * raw Prisma/DB error internals to the client.
 */
export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: err.message, details: err.details },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: err.flatten() },
      { status: 422 }
    );
  }

  // Prisma unique constraint violation
  if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
    return NextResponse.json(
      { success: false, error: "A record with this value already exists" },
      { status: 409 }
    );
  }

  console.error("[API_ERROR]", err);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
