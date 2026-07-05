import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * The single "page title" pattern used at the top of every top-level page
 * (About, Download, Features, FAQ, Contact, Privacy Policy, Search…).
 * Always renders an <h1> — there should be exactly one per page. For
 * headings inside a page's body, use SectionHeading (<h2>) instead.
 */
export function PageHero({ eyebrow, title, description, align = "center", className }: PageHeroProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="text-xs font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 text-balance text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
