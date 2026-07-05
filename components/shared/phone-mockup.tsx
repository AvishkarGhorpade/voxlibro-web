import { Play, ChevronLeft, Mic2 } from "lucide-react";

import { Waveform } from "@/components/shared/waveform";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  className?: string;
}

/**
 * Stylized illustration of VoxLibro's core text-to-speech screen. This is a
 * representative mockup, not a real screenshot — it shows the shape of the
 * experience (pasted text, character count, voice selection, playback)
 * without claiming any specific in-app content.
 */
export function PhoneMockup({ className }: PhoneMockupProps) {
  const sampleText =
    "Paste or type any text here — notes, an article, a chapter — and VoxLibro reads it back to you.";

  return (
    <div className={cn("relative mx-auto w-[280px] select-none", className)}>
      <div className="relative rounded-[2.75rem] border border-border bg-surface p-3 shadow-2xl shadow-black/40">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background" />
        <div className="relative overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-surface-raised to-background">
          <div className="flex items-center justify-between px-5 pb-2 pt-8 text-xs text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span>VoxLibro</span>
            <Mic2 className="h-4 w-4" />
          </div>

          <div className="mx-5 mt-3 rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">{sampleText}</p>
            <p className="mt-3 text-right text-[10px] text-muted-foreground/70">
              {sampleText.length} characters
            </p>
          </div>

          <div className="mx-5 mt-4 flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-[11px] text-foreground">Voice</span>
            <span className="text-[11px] text-accent">Default ▾</span>
          </div>

          <div className="px-6 pt-6">
            <Waveform bars={22} className="mx-auto h-8" />
          </div>

          <div className="flex items-center justify-center pb-8 pt-5">
            <button
              type="button"
              aria-label="Play"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30"
            >
              <Play className="h-5 w-5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
