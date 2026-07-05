import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Hero } from "@/components/shared/hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { FeatureCard } from "@/components/shared/feature-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";
import { features, faqs } from "@/lib/site-content";

export const metadata = buildMeta({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
});

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  operatingSystem: "Android",
  applicationCategory: "UtilitiesApplication",
  author: {
    "@type": "Person",
    name: siteConfig.developer,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareAppSchema} />
      <Hero />

      <section className="py-24 sm:py-32">
        <div className="container">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need to listen instead of read"
            description="A free Android text-to-speech app built around real reading and study habits."
          />
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container-narrow">
          <SectionHeading eyebrow="FAQ" title="Common questions" align="center" />
          <div className="mt-12">
            <FaqAccordion items={faqs.slice(0, 5)} />
          </div>
          <div className="mt-8 text-center">
            <Button variant="link" asChild>
              <Link href="/faq">
                View all questions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <div className="container flex flex-col items-center gap-6 text-center">
          <SectionHeading
            title="Start listening today"
            description="Free, with no account or subscription required."
          />
          <Button size="lg" asChild>
            <Link href="/download">
              Get VoxLibro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
