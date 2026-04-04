import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";
import { successResponse, errorResponse } from "@/lib/api-response";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  // Video
  "video/mp4",
  "video/webm",
  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
]);

const IMAGE_CONVERT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const projectId = formData.get("projectId") as string | null;

    if (!file || !(file instanceof File)) {
      return errorResponse("NO_FILE", "No file provided", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse("INVALID_TYPE", `Type "${file.type}" not allowed`, 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("FILE_TOO_LARGE", "Max file size is 25 MB", 400);
    }

    // Determine upload directory
    const subDir = projectId ? join(projectId) : "";
    const uploadDir = join(process.cwd(), "public", "uploads", subDir);

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    let ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    // Convert raster images to webp
    if (IMAGE_CONVERT_TYPES.has(file.type)) {
      buffer = Buffer.from(await sharp(buffer).webp({ quality: 80 }).toBuffer());
      ext = ".webp";
    }

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const url = projectId ? `/uploads/${projectId}/${safeName}` : `/uploads/${safeName}`;

    return successResponse({
      url,
      name: file.name,
      type: file.type,
      size: buffer.length,
    });
  } catch (e) {
    return errorResponse("UPLOAD_ERROR", "Failed to upload file", 500);
  }
}
