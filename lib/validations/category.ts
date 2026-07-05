import { z } from "zod";

export const upsertCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
    .max(100)
    .optional(),
  description: z.string().trim().max(300).optional(),
});

export type UpsertCategoryInput = z.infer<typeof upsertCategorySchema>;
