import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = "voxlibro/uploads";

/**
 * Uploads a base64/data-URI or remote URL buffer to Cloudinary with
 * automatic format + quality optimization applied at upload time.
 */
export async function uploadImage(
  fileDataUri: string,
  opts?: { folder?: string; filenameHint?: string }
): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(fileDataUri, {
    folder: opts?.folder ?? CLOUDINARY_FOLDER,
    resource_type: "image",
    // Cloudinary picks the best format (e.g. AVIF/WebP) per requesting browser
    // and compresses without visible quality loss — this is our "image
    // optimization" layer, no separate image pipeline needed.
    fetch_format: "auto",
    quality: "auto",
    filename_override: opts?.filenameHint,
    use_filename: Boolean(opts?.filenameHint),
    unique_filename: true,
    overwrite: false,
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export default cloudinary;
