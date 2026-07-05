import { Mail } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { ContactForm } from "@/components/shared/contact-form";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";

export const metadata = buildMeta({
  title: "Contact",
  description: "Get in touch about VoxLibro.",
  path: "/contact",
});

export default function ContactPage() {
  const { contactEmail } = siteConfig.links;

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <PageHero
          eyebrow="Contact"
          title="Get in touch"
          description="Questions, feedback, or bug reports — send a message and it'll be reviewed directly."
        />

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {contactEmail && (
              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a href={`mailto:${contactEmail}`} className="text-sm text-muted-foreground hover:text-accent">
                    {contactEmail}
                  </a>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              VoxLibro is built and maintained by {siteConfig.developer}, an
              independent Android developer — there&apos;s no support team, so
              please allow some time for a response.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
