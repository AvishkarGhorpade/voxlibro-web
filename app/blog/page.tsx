import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { BlogPostCard } from "@/components/shared/blog-post-card";
import { Button } from "@/components/ui/button";
import { listPublishedPosts } from "@/lib/posts";
import { buildMeta } from "@/lib/seo/meta";

export const metadata = buildMeta({
  title: "Blog",
  description: "Notes on text-to-speech, Android, accessibility, and productivity.",
  path: "/blog",
});

export const revalidate = 300;

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

function buildPageHref(page: number, category?: string, tag?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page, category, tag } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const { posts, pagination } = await listPublishedPosts({
    page: currentPage,
    pageSize: 9,
    category,
    tag,
  });

  const [featured, ...rest] = currentPage === 1 ? posts : [undefined, ...posts];
  const activeFilter = category
    ? { label: "category", value: category }
    : tag
      ? { label: "tag", value: tag }
      : null;

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Blog"
          title="Notes from the developer"
          description="Text-to-speech, Android, accessibility, and productivity."
          align="left"
          className="mx-0 text-left"
        />

        {activeFilter && (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            Filtered by {activeFilter.label}: <strong className="text-foreground">{activeFilter.value}</strong>
            <Link href="/blog" className="text-accent hover:underline">
              Clear
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="mt-14 rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No posts found.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {featured && <BlogPostCard post={featured} featured />}
            {rest.filter(Boolean).map((post) => (
              <BlogPostCard key={post!.id} post={post!} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" asChild disabled={currentPage <= 1}>
              <Link
                href={buildPageHref(currentPage - 1, category, tag)}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button variant="outline" size="sm" asChild disabled={currentPage >= pagination.totalPages}>
              <Link
                href={buildPageHref(currentPage + 1, category, tag)}
                aria-disabled={currentPage >= pagination.totalPages}
                tabIndex={currentPage >= pagination.totalPages ? -1 : undefined}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
