import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/shared/waveform";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade-bottom" aria-hidden="true" />
      <div className="container relative flex flex-col items-center text-center">
        <Waveform bars={20} active={false} className="h-10" />
        <p className="mt-8 text-sm font-medium uppercase tracking-widest text-accent">
          404
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-4 max-w-md text-balance text-muted-foreground">
          The page you&apos;re looking for was moved, renamed, or never existed
          in the first place.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search">
              <Search className="h-4 w-4" />
              Search VoxLibro
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
