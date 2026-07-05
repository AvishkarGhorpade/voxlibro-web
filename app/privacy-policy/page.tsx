import { PageHero } from "@/components/shared/page-hero";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";

export const metadata = buildMeta({
  title: "Privacy Policy",
  description: "How this website and VoxLibro handle data.",
  path: "/privacy-policy",
});

/**
 * IMPORTANT: per project instructions, this page must never contain an
 * invented privacy policy. The sections below describe only what this
 * website's own code actually does (contact form storage, first-party
 * analytics) — verifiable directly in the codebase. The Android app's
 * privacy policy (covering on-device permissions, data the app itself
 * collects, etc.) is a separate, required document that must be written
 * and supplied by the developer, then linked here — it is not invented
 * or guessed at in this file.
 */
const websiteSections = [
  {
    title: "Contact form",
    body: "If you submit the contact form on this site, your name, email address, subject, and message are stored so the developer can respond to you. This information is not sold or shared with third parties.",
  },
  {
    title: "Analytics",
    body: "This site records basic, privacy-preserving usage analytics (such as page views and search queries) to understand how the site is used. Visitor IP addresses are never stored in readable form — they are one-way hashed before being saved.",
  },
  {
    title: "Theme preference",
    body: "Your light/dark mode preference is stored locally in your browser and is never sent to a server.",
  },
  {
    title: "No advertising",
    body: "This website does not run third-party advertising or ad-tracking scripts.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-narrow">
        <PageHero eyebrow="Legal" title="Privacy Policy" align="left" className="mx-0" />

        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">This website</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {siteConfig.name} ({siteConfig.url}) is operated by an
              independent developer, {siteConfig.developer} — there is no
              company. This section covers only what this marketing/blog
              website does; it does not cover the Android app itself.
            </p>
          </div>

          {websiteSections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">VoxLibro (the Android app)</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              The Android app&apos;s own privacy policy — covering permissions
              and any data the app itself processes on your device — is
              published separately and has not yet been added here. Contact{" "}
              {siteConfig.links.contactEmail ?? "the developer"} for the
              current version.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
