import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";

const UPLOAD_ROOT = join(process.cwd(), "public", "uploads");

const EXT_TYPE_MAP: Record<string, string> = {
  ".webp": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".gif": "image",
  ".svg": "image",
  ".avif": "image",
  ".mp4": "video",
  ".webm": "video",
  ".mp3": "audio",
  ".wav": "audio",
  ".ogg": "audio",
  ".pdf": "document",
  ".doc": "document",
  ".docx": "document",
  ".csv": "document",
};

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId") || "";
    const dir = projectId ? join(UPLOAD_ROOT, projectId) : UPLOAD_ROOT;

    if (!existsSync(dir)) {
      return successResponse([]);
    }

    const entries = await readdir(dir);
    const files = await Promise.all(
      entries
        .filter((name) => {
          const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
          return ext in EXT_TYPE_MAP;
        })
        .map(async (name) => {
          const filePath = join(dir, name);
          const s = await stat(filePath);
          const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
          const url = projectId ? `/uploads/${projectId}/${name}` : `/uploads/${name}`;
          return {
            url,
            name,
            type: EXT_TYPE_MAP[ext] || "other",
            size: s.size,
            modifiedAt: s.mtime.toISOString(),
          };
        })
    );

    // Sort newest first
    files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return successResponse(files);
  } catch (e) {
    return errorResponse("LIST_ERROR", "Failed to list uploads", 500);
  }
}
