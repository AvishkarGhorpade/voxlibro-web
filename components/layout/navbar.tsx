"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { mainNav, siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { CommandMenu } from "@/components/shared/command-menu";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) ) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-lg supports-[backdrop-filter]:bg-background/50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label={siteConfig.name}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {mainNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground"
                  )}
                >
                  {item.title}
                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="absolute -bottom-[19px] left-0 right-0 h-px bg-accent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <ThemeToggle />
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/download">Get the app</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
              <Button asChild className="mt-2">
                <Link href="/download">Get the app</Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </header>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
