import { PageHero } from "@/components/shared/page-hero";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { buildMeta } from "@/lib/seo/meta";
import { faqs } from "@/lib/site-content";
import type { FaqItem } from "@/types";

export const metadata = buildMeta({
  title: "FAQ",
  description: "Answers to common questions about VoxLibro.",
  path: "/faq",
});

function groupByCategory(items: FaqItem[]) {
  return items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    const key = item.category ?? "General";
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});
}

export default function FaqPage() {
  const grouped = groupByCategory(faqs);

  return (
    <section className="py-20 sm:py-28">
      <div className="container-narrow">
        <PageHero
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Can't find what you're looking for? Reach out on the contact page."
        />

        <div className="mt-16 space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                {category}
              </h2>
              <div className="mt-4">
                <FaqAccordion items={items} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
