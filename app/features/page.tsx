import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { FeatureCard } from "@/components/shared/feature-card";
import { PhoneMockup } from "@/components/shared/phone-mockup";
import { Waveform } from "@/components/shared/waveform";
import { buildMeta } from "@/lib/seo/meta";
import { features } from "@/lib/site-content";

export const metadata = buildMeta({
  title: "Features",
  description: "Everything VoxLibro does to turn text into speech.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid mask-fade-bottom" aria-hidden="true" />
        <div className="container relative grid grid-cols-1 items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <PageHero
              eyebrow="Features"
              title="Every detail tuned for listening"
              align="left"
              className="mx-0"
            />
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              VoxLibro is a free, lightweight Android app built specifically
              for converting text into speech — for students, teachers,
              professionals, and anyone who prefers audio learning.
            </p>
            <Waveform bars={16} className="mt-8 h-8" />
          </div>
          <PhoneMockup />
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="container">
          <SectionHeading
            eyebrow="Everything, listed"
            title="The full feature set"
            description="A closer look at what VoxLibro does."
          />
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
