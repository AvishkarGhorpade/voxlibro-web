// lib/seo/meta.ts
//
// Single source of truth for page <title>/<meta description>/OG/Twitter/
// canonical tags. Every route's generateMetadata() should call buildMeta()
// instead of hand-authoring a Metadata object — see
// docs/seo/06-META-TEMPLATES.md for the template table this implements.

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface BuildMetaArgs {
  title: string;
  description: string;
  /** Root-relative path, e.g. "/blog/my-post-slug" */
  path: string;
  /** Absolute or root-relative OG image. Defaults to siteConfig.ogImage. */
  image?: string;
  type?: "website" | "article";
  /** ISO date string — article type only */
  publishedTime?: string;
  /** ISO date string — article type only */
  modifiedTime?: string;
  /** Set true for query-string / utility pages (e.g. /search) */
  noindex?: boolean;
}

export function buildMeta({
  title,
  description,
  path,
  image = siteConfig.ogImage,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: BuildMetaArgs): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630 }],
      type,
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
