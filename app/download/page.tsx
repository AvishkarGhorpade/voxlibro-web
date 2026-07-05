import Link from "next/link";
import { Smartphone } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { PhoneMockup } from "@/components/shared/phone-mockup";
import { Button } from "@/components/ui/button";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";

export const metadata = buildMeta({
  title: "Download",
  description: "Get VoxLibro free on Android.",
  path: "/download",
});

export default function DownloadPage() {
  const playStoreUrl = siteConfig.links.playStore;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid mask-fade-bottom" aria-hidden="true" />
        <div className="container relative grid grid-cols-1 items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <PageHero
              eyebrow="Download"
              title="Get VoxLibro on Android"
              description="VoxLibro is free and available on Android. No account, no subscription."
              align="left"
              className="mx-0"
            />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {playStoreUrl ? (
                <Button size="lg" asChild>
                  <Link href={playStoreUrl} target="_blank" rel="noreferrer noopener">
                    <Smartphone className="h-4 w-4" />
                    Get it on Google Play
                  </Link>
                </Button>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-card px-5 py-4 text-sm text-muted-foreground">
                  Google Play link coming soon.
                </div>
              )}
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container">
          <SectionHeading eyebrow="Platform" title="Built for Android" />
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-[15px] font-semibold text-foreground">Free, always</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No subscription, no paywall, no usage limits.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-[15px] font-semibold text-foreground">Works offline</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Generate and listen to speech without an internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
