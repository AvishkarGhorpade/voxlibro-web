import { marked } from "marked";
import { sanitizeHtml } from "@/lib/security";

marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Posts are stored as raw markdown (see Post.content in schema.prisma).
 * We render to HTML on read, then sanitize — never the other way around,
 * and never store pre-rendered HTML, so a change in sanitization rules
 * applies retroactively to all existing content.
 */
export function renderMarkdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  return sanitizeHtml(rawHtml);
}
