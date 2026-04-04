import { readdir } from "fs/promises";
import { join } from "path";
import { successResponse, errorResponse } from "@/lib/api-response";

const STOCK_DIR = join(process.cwd(), "public", "stock");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]);

export async function GET() {
  try {
    const categories = await readdir(STOCK_DIR);
    const result: Record<string, string[]> = {};

    for (const cat of categories) {
      const catPath = join(STOCK_DIR, cat);
      try {
        const files = await readdir(catPath);
        result[cat] = files
          .filter((f) => ALLOWED_EXT.has(f.slice(f.lastIndexOf(".")).toLowerCase()))
          .map((f) => `/stock/${cat}/${f}`);
      } catch {
        // skip non-directories
      }
    }

    return successResponse(result);
  } catch (e) {
    return errorResponse("STOCK_READ_ERROR", "Failed to read stock images", 500);
  }
}
