import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/shared/waveform";
import { PhoneMockup } from "@/components/shared/phone-mockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade-bottom" aria-hidden="true" />
      <div className="absolute inset-0 bg-radial-glow" aria-hidden="true" />

      <div className="container relative grid grid-cols-1 items-center gap-16 pb-20 pt-20 lg:grid-cols-2 lg:pb-32 lg:pt-28">
        <div>
          <div
            className="motion-safe:animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Free on Android
          </div>

          <h1
            className="motion-safe:animate-fade-up mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.2rem]"
            style={{ animationDelay: "60ms" }}
          >
            Text,
            <br />
            <span className="text-accent">spoken.</span>
          </h1>

          <p
            className="motion-safe:animate-fade-up mt-6 max-w-md text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            VoxLibro converts your notes, articles, documents, and study
            material into speech — free, and with offline support, so you
            can listen instead of reading manually.
          </p>

          <div
            className="motion-safe:animate-fade-up mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "180ms" }}
          >
            <Button size="lg" asChild>
              <Link href="/download">
                Get VoxLibro free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/features">
                <Play className="h-4 w-4 fill-current" />
                See what it does
              </Link>
            </Button>
          </div>

          <div
            className="motion-safe:animate-fade-up mt-12 flex items-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <Waveform bars={18} className="h-8" />
            <p className="text-xs text-muted-foreground">
              Free · No account required · Works offline
            </p>
          </div>
        </div>

        <div className="motion-safe:animate-fade-up relative flex justify-center" style={{ animationDelay: "150ms" }}>
          <div className="absolute -inset-16 -z-10 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
