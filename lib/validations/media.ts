import { z } from "zod";

// The client sends the image as a base64 data URI (or a URL to fetch),
// plus optional metadata. Actual bytes are handled by Cloudinary, never
// stored in our DB or passed through unsanitized to disk.
export const uploadMediaSchema = z.object({
  file: z
    .string()
    .refine(
      (val) => val.startsWith("data:image/") || val.startsWith("https://"),
      "file must be a base64 image data URI or an https URL"
    ),
  altText: z.string().trim().max(200).optional(),
  folder: z.string().trim().max(100).optional(),
});

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
