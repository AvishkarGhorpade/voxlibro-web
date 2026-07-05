import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";

import { formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BlogPostSummary } from "@/types";

export function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogPostSummary;
  featured?: boolean;
}) {
  const tags = post.tags.slice(0, 2).map((t) => t.tag);

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/40",
        featured && "md:col-span-2"
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={cn(
            "relative flex w-full items-center justify-center overflow-hidden bg-surface-raised",
            featured ? "aspect-[21/9]" : "aspect-[16/10]"
          )}
        >
          {post.coverImage ? (
            <Image
              src={post.coverImage.secureUrl}
              alt={post.coverImage.altText ?? ""}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={featured ? "100vw" : "(min-width: 768px) 33vw, 100vw"}
            />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </Link>
      <div className="p-6">
        {(tags.length > 0 || post.category) && (
          <div className="flex flex-wrap items-center gap-2">
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`} className="relative z-10">
                <Badge variant="secondary">{post.category.name}</Badge>
              </Link>
            )}
            {tags.map((tag) => (
              <Link key={tag.slug} href={`/blog?tag=${tag.slug}`} className="relative z-10">
                <Badge variant="secondary">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}
        <Link href={`/blog/${post.slug}`} className="block">
          <h3
            className={cn(
              "mt-3 font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors",
              featured ? "text-2xl" : "text-lg"
            )}
          >
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {post.author.name && <span>{post.author.name}</span>}
            {post.author.name && post.publishedAt && <span aria-hidden="true">·</span>}
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
            {post.readingTimeMinutes != null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
