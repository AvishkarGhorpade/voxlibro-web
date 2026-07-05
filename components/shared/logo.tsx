import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="0" y="4" width="2" height="6" rx="1" fill="hsl(var(--accent-foreground))" />
          <rect x="4" y="1" width="2" height="12" rx="1" fill="hsl(var(--accent-foreground))" />
          <rect x="8" y="3" width="2" height="8" rx="1" fill="hsl(var(--accent-foreground))" />
          <rect x="12" y="5" width="2" height="4" rx="1" fill="hsl(var(--accent-foreground))" />
        </svg>
      </span>
      <span className="text-[15px] text-foreground">VoxLibro</span>
    </span>
  );
}
