import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/utils";
import { getPublishedPostBySlug } from "@/lib/posts";
import { buildMeta } from "@/lib/seo/meta";
import { siteConfig } from "@/config/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return buildMeta({
    title: post.title,
    description: post.excerpt ?? post.title,
    path: `/blog/${post.slug}`,
    image: post.coverImage?.secureUrl,
    type: "article",
    publishedTime: post.publishedAt ?? undefined,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const authorName = post.author.name ?? siteConfig.developer;
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    author: { "@type": "Person", name: authorName },
    image: post.coverImage?.secureUrl,
  };

  return (
    <article className="py-16 sm:py-20">
      <div className="container-narrow">
        <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: post.title, path: `/blog/${post.slug}` }]} />
        <JsonLd data={articleSchema} />

        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </Button>

        {(post.category || post.tags.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`}>
                <Badge variant="secondary">{post.category.name}</Badge>
              </Link>
            )}
            {post.tags.map(({ tag }) => (
              <Link key={tag.slug} href={`/blog?tag=${tag.slug}`}>
                <Badge variant="secondary">{tag.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center gap-3">
          <Avatar>
            {post.author.image && <AvatarImage src={post.author.image} alt={authorName} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-foreground">{authorName}</p>
            <p className="text-muted-foreground">
              {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
              {post.readingTimeMinutes != null && (
                <>
                  {post.publishedAt && " · "}
                  {post.readingTimeMinutes} min read
                </>
              )}
            </p>
          </div>
        </div>

        {post.coverImage && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-raised">
            <Image
              src={post.coverImage.secureUrl}
              alt={post.coverImage.altText ?? ""}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 768px) 720px, 100vw"
            />
          </div>
        )}

        <div
          className="prose-voxlibro mt-10 max-w-none text-[15px] leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
    </article>
  );
}
