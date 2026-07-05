// components/seo/breadcrumbs.tsx
//
// Visible breadcrumb trail. Pass the same `items` array to
// buildBreadcrumbSchema() (lib/seo/breadcrumb-schema.ts) for the matching
// JSON-LD — see docs/seo/07-STRUCTURED-DATA.md and 11-INTERNAL-LINKING.md.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/seo/breadcrumb-schema";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-foreground">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
