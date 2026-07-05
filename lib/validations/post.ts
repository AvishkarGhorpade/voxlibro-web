import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
    .max(220)
    .optional(),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().min(1, "Content cannot be empty"),
  categoryId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string().cuid()).max(20).optional().default([]),
  coverImageId: z.string().cuid().optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial();

export const autosavePostSchema = z.object({
  title: z.string().trim().max(200).optional().default(""),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().optional().default(""),
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  category: z.string().optional(), // slug
  tag: z.string().optional(), // slug
  search: z.string().max(200).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type AutosavePostInput = z.infer<typeof autosavePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
