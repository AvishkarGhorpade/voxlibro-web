export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface PostAuthor {
  name: string | null;
  image?: string | null;
}

export interface PostCategory {
  name: string;
  slug: string;
}

export interface PostTag {
  name: string;
  slug: string;
}

export interface PostCoverImage {
  secureUrl: string;
  altText: string | null;
}

/** Shape returned by GET /api/posts and GET /api/search (list views). */
export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  readingTimeMinutes: number | null;
  publishedAt: string | null;
  viewCount: number;
  author: PostAuthor;
  category: PostCategory | null;
  tags: { tag: PostTag }[];
  coverImage: PostCoverImage | null;
}

/** Shape returned by GET /api/posts/:slug (single article view). */
export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  contentHtml: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
