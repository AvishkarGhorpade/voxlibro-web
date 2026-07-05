"use client";

import { cn } from "@/lib/utils";

interface WaveformProps {
  bars?: number;
  active?: boolean;
  className?: string;
  barClassName?: string;
}

/**
 * Animated audio waveform — VoxLibro's signature visual motif.
 * Each bar animates independently with a staggered delay to feel like a real speech waveform.
 * Respects prefers-reduced-motion via the global animation override in globals.css.
 */
export function Waveform({ bars = 24, active = true, className, barClassName }: WaveformProps) {
  // Deterministic, integer-only hash so server and client always compute
  // the exact same bytes. Math.sin/cos (the previous approach) are NOT
  // guaranteed bit-identical across different JS engines or CPUs — the
  // ECMAScript spec doesn't mandate exact transcendental-function
  // precision — which caused a real SSR/CSR hydration mismatch here.
  function seededFraction(i: number): number {
    let x = (i + 1) * 2654435761;
    x = (x ^ (x >>> 16)) >>> 0;
    x = (x * 2246822519) >>> 0;
    x = (x ^ (x >>> 13)) >>> 0;
    return (x % 1000) / 1000;
  }

  const heights = Array.from({ length: bars }, (_, i) => 0.25 + seededFraction(i) * 0.75);

  return (
    <div className={cn("flex h-10 w-fit items-center gap-[3px]", className)} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full bg-accent origin-center",
            active ? "animate-wave" : "",
            barClassName
          )}
          style={{
            height: `${Math.max(h * 100, 15).toFixed(2)}%`,
            animationDelay: `${(i % 8) * 0.09}s`,
            animationDuration: `${0.9 + (i % 5) * 0.15}s`,
            opacity: active ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}
