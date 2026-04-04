/**
 * Shared AI utility functions.
 */

/** Safe JSON.parse that never throws - returns fallback on failure. */
export function safeJsonParse(str: string | null | undefined, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (!str) return fallback;
  try { return JSON.parse(str) as Record<string, unknown>; } catch { return fallback; }
}

