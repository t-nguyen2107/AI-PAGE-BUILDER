import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { successResponse, errorResponse } from "@/lib/api-response";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return errorResponse("NO_FILE", "No file provided", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return errorResponse("INVALID_TYPE", `Type "${file.type}" not allowed`, 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("FILE_TOO_LARGE", "Max file size is 5 MB", 400);
    }

    // Ensure upload dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate safe unique filename
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = join(UPLOAD_DIR, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return successResponse({ url: `/uploads/${safeName}`, name: file.name });
  } catch (e) {
    return errorResponse("UPLOAD_ERROR", "Failed to upload file", 500);
  }
}
