/**
 * Shared AI utility functions.
 */

/** Safe JSON.parse that never throws - returns fallback on failure. */
export function safeJsonParse(str: string | null | undefined, fallback: Record<string, unknown> = {}): Record<string, unknown> {
  if (!str) return fallback;
  try { return JSON.parse(str) as Record<string, unknown>; } catch { return fallback; }
}

// ─── Emoji stripping (shared) ──────────────────────────────────────────────

const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

export function stripEmojis(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

