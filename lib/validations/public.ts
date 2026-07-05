import { z } from "zod";

export const publicPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(9),
  category: z.string().trim().max(100).optional(), // slug
  tag: z.string().trim().max(60).optional(), // slug
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required").max(200),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type PublicPostsQuery = z.infer<typeof publicPostsQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
