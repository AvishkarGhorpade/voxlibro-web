import { z } from "zod";

export const trackEventSchema = z.object({
  type: z.enum(["PAGE_VIEW", "POST_VIEW", "SEARCH"]),
  path: z.string().trim().max(500).optional(),
  postId: z.string().cuid().optional(),
  query: z.string().trim().max(200).optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
