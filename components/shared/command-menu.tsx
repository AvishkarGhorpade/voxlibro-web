"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  BookOpen,
  Download,
  Home,
  Info,
  Mail,
  HelpCircle,
  FileText,
  Search,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Features", href: "/features" },
  { icon: Download, label: "Download", href: "/download" },
  { icon: Info, label: "About", href: "/about" },
  { icon: FileText, label: "Blog", href: "/blog" },
  { icon: HelpCircle, label: "FAQ", href: "/faq" },
  { icon: Mail, label: "Contact", href: "/contact" },
];

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [router, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <Command className="flex flex-col" label="Command menu">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search pages, features, docs…"
              className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-xs font-medium text-muted-foreground px-2 py-1.5 [&_[cmdk-group-items]]:mt-1">
              {items.map((item) => (
                <Command.Item
                  key={item.href}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground data-[selected=true]:bg-accent-muted data-[selected=true]:text-accent"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
