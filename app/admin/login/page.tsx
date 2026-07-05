import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Logo } from "@/components/shared/logo";
import { LoginForm } from "./login-form";
import { buildMeta } from "@/lib/seo/meta";

export const metadata = buildMeta({
  title: "Admin Login",
  description: "VoxLibro admin sign-in.",
  path: "/admin/login",
  noindex: true,
});

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin/posts");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-lg font-semibold text-foreground">
          Admin sign-in
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          This area is for the site owner only.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
