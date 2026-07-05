import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, FileText } from "lucide-react";

import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <Link
              href="/admin/posts"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <FileText className="h-4 w-4" />
              Posts
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
