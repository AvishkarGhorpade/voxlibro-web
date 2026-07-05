import { PageHero } from "@/components/shared/page-hero";
import { Waveform } from "@/components/shared/waveform";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";

export const metadata = buildMeta({
  title: "About",
  description: "Why VoxLibro exists, and who builds it.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid mask-fade-bottom" aria-hidden="true" />
        <div className="container-narrow relative py-20 lg:py-28">
          <PageHero
            eyebrow="About"
            title="A simple, free way to listen instead of read"
            description="Many text-to-speech apps are paid, require an internet connection, or come with usage limits. VoxLibro is built to be free, clean, and easy to use."
          />
          <Waveform bars={20} className="mx-auto mt-8 h-8" />
        </div>
      </section>

      <section className="py-20">
        <div className="container-narrow space-y-6 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            VoxLibro is independently designed and developed by{" "}
            {siteConfig.developer}. It&apos;s his first Android application
            published on Google Play.
          </p>
          <p>
            There&apos;s no company behind VoxLibro and no team — it&apos;s
            built and maintained by a single developer. The goal is
            straightforward: give people a free, reliable way to turn notes,
            articles, documents, and study material into speech, without
            paywalls or an internet connection requirement getting in the
            way.
          </p>
        </div>
      </section>
    </>
  );
}
