import { z } from "zod";

export const upsertTagSchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
    .max(60)
    .optional(),
});

export type UpsertTagInput = z.infer<typeof upsertTagSchema>;
