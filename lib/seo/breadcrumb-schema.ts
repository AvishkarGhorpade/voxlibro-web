// lib/seo/breadcrumb-schema.ts
//
// Builds BreadcrumbList JSON-LD from the same items array that drives the
// visible <Breadcrumbs /> component (components/seo/breadcrumbs.tsx) —
// keep them driven by one source so the schema never drifts from what's
// on the page.

import { siteConfig } from "@/config/site";

export interface BreadcrumbItem {
  name: string;
  /** Root-relative path, e.g. "/blog/category/book-recommendations" */
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
