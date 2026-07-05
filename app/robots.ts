// app/robots.ts
//
// Next.js's built-in robots convention — automatically served at
// /robots.txt. Mirrors app/sitemap.ts in spirit: one file, no manual
// maintenance. See docs/seo/08-TECHNICAL-SEO.md.

import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // all API routes, admin and public — never crawlable
          "/search", // query-string search results — thin/duplicate content
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
