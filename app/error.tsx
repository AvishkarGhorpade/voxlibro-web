"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real error reporting (Sentry, etc.) when available.
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          An unexpected error interrupted this page. Try again, or head back
          home.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Button onClick={() => reset()}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
