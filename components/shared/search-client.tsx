"use client";

import * as React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import { PageHero } from "@/components/shared/page-hero";
import { SearchBar } from "@/components/shared/search-bar";
import { SearchResultsSkeleton } from "@/components/skeletons/search-results-skeleton";
import { searchPosts } from "@/lib/blog-api-client";
import { formatDate } from "@/lib/utils";
import type { BlogPostSummary } from "@/types";

export function SearchClient() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await searchPosts(query, controller.signal);
        setResults(data);
      } catch {
        // Ignore aborted/failed requests — the UI just shows no results.
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <section className="py-20 sm:py-28">
      <div className="container-narrow">
        <PageHero eyebrow="Search" title="Search the blog" align="left" className="mx-0" />

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search articles…"
          className="mt-8"
          autoFocus
        />

        {query.trim() && (
          <p className="mt-6 text-sm text-muted-foreground">
            {loading ? "Searching…" : `${results.length} ${results.length === 1 ? "result" : "results"}`}
          </p>
        )}

        {loading && query.trim() ? (
          <div className="mt-4">
            <SearchResultsSkeleton />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {results.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/30 via-accent-muted to-surface-raised">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                    {post.excerpt && (
                      <p className="truncate text-xs text-muted-foreground">{post.excerpt}</p>
                    )}
                  </div>
                  {post.publishedAt && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                </Link>
              </li>
            ))}

            {query.trim() && results.length === 0 && (
              <li className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                No articles match &ldquo;{query}&rdquo;.
              </li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}
