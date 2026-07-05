import * as Icons from "lucide-react";

import { cn } from "@/lib/utils";
import type { FeatureItem } from "@/types";

interface FeatureCardProps {
  feature: FeatureItem;
  className?: string;
  index?: number;
}

export function FeatureCard({ feature, className, index = 0 }: FeatureCardProps) {
  const Icon = (Icons[feature.icon as keyof typeof Icons] ?? Icons.Sparkles) as Icons.LucideIcon;

  return (
    <div
      className={cn(
        "motion-safe:animate-fade-up group relative rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/40",
        className
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-muted text-accent transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-[15px] font-semibold text-foreground">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </div>
  );
}
