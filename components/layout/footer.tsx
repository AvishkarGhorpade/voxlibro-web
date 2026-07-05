import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

import { footerNav, siteConfig } from "@/config/site";
import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";

const columns = [
  { title: "Product", links: footerNav.product },
  { title: "Company", links: footerNav.company },
  { title: "Resources", links: footerNav.resources },
];

export function Footer() {
  const { github, twitter, contactEmail } = siteConfig.links;
  const hasSocialLinks = Boolean(github || twitter || contactEmail);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            {hasSocialLinks && (
              <div className="mt-6 flex items-center gap-3">
                {twitter && (
                  <SocialLink href={twitter} label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </SocialLink>
                )}
                {github && (
                  <SocialLink href={github} label="GitHub">
                    <Github className="h-4 w-4" />
                  </SocialLink>
                )}
                {contactEmail && (
                  <SocialLink href={`mailto:${contactEmail}`} label="Email">
                    <Mail className="h-4 w-4" />
                  </SocialLink>
                )}
              </div>
            )}
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col-reverse items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.developer}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer noopener" : undefined}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}
