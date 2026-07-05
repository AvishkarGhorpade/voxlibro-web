/**
 * Site configuration.
 *
 * VoxLibro is a free, independently developed Android app by Avishkar
 * Ghorpade — there is no company, subscription plan, or confirmed public
 * URLs beyond what's set via environment variables below. Never hardcode
 * invented values here (fake domains, fake social handles, fake emails);
 * anything not yet known is left undefined and the UI hides it until set.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "VoxLibro",
  tagline: "Text, spoken.",
  description:
    "VoxLibro converts written text into speech, so you can listen to notes, articles, documents, and study material instead of reading manually.",
  url: siteUrl,
  ogImage: `${siteUrl}/og.png`,
  developer: "Avishkar Ghorpade",
  links: {
    // Only set if a real, working link exists. Left undefined otherwise —
    // components must check for this rather than rendering a dead link.
    playStore:
      process.env.NEXT_PUBLIC_PLAY_STORE_URL ||
      "https://play.google.com/store/apps/details?id=com.avishkar.voxlibro",
    github: process.env.NEXT_PUBLIC_GITHUB_URL || undefined,
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || undefined,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
  },
} as const;

export const mainNav = [
  { title: "Features", href: "/features" },
  { title: "Download", href: "/download" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "FAQ", href: "/faq" },
] as const;

export const footerNav = {
  product: [
    { title: "Features", href: "/features" },
    { title: "Download", href: "/download" },
  ],
  company: [
    { title: "About", href: "/about" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
  ],
  resources: [
    { title: "FAQ", href: "/faq" },
    { title: "Privacy Policy", href: "/privacy-policy" },
  ],
} as const;
