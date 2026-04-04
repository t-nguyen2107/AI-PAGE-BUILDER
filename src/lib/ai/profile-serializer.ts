/**
 * Project Profile Serializer — converts profile + memories into
 * compact prompt text for AI context injection.
 *
 * Target: <800 characters (~200 tokens) to minimize prompt overhead.
 */

interface ProfileData {
  businessType?: string;
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
  contentThemes?: string;
  componentPrefs?: string;
  memoryNotes?: string;
}

interface MemoryItem {
  content: string;
  category: string;
  score?: number;
}

export interface ProjectContext {
  profile: ProfileData | null;
  relevantMemories: MemoryItem[];
}

export function serializeProfileForPrompt(ctx: ProjectContext): string {
  const { profile, relevantMemories } = ctx;

  if (!profile && relevantMemories.length === 0) return '';

  const lines: string[] = ['## Project Knowledge'];

  // Core identity
  if (profile) {
    const identity = [
      profile.businessName && profile.businessType
        ? `${profile.businessName} — ${profile.businessType}`
        : profile.businessName || profile.businessType,
      profile.industry ? `Industry: ${profile.industry}` : '',
      profile.targetAudience ? `Audience: ${profile.targetAudience}` : '',
      profile.tone ? `Tone: ${profile.tone}` : '',
      profile.preferredStyle ? `Style: ${profile.preferredStyle}` : '',
      profile.language && profile.language !== 'en'
        ? `Language: ${profile.language}`
        : '',
    ].filter(Boolean);

    if (identity.length > 0) {
      lines.push(identity.join('. ') + '.');
    }

    // Content themes
    if (profile.contentThemes) {
      try {
        const themes = JSON.parse(profile.contentThemes) as string[];
        if (themes.length > 0) {
          lines.push(`Content themes: ${themes.slice(0, 5).join(', ')}.`);
        }
      } catch { /* ignore */ }
    }

    // Component preferences
    if (profile.componentPrefs) {
      try {
        const prefs = JSON.parse(profile.componentPrefs) as Record<string, number>;
        const top = Object.entries(prefs)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type);
        if (top.length > 0) {
          lines.push(`Frequently used: ${top.join(', ')}.`);
        }
      } catch { /* ignore */ }
    }
  }

  // Relevant memories (top 3 most relevant)
  if (relevantMemories.length > 0) {
    const memNotes = relevantMemories
      .slice(0, 3)
      .map((m) => m.content);
    for (const note of memNotes) {
      lines.push(`- ${note}`);
    }
  }

  const result = lines.join('\n');

  // Trim to ~800 chars, cutting at last complete line
  if (result.length > 800) {
    const truncated = result.slice(0, 800);
    const lastNewline = truncated.lastIndexOf('\n');
    return truncated.slice(0, lastNewline) + '\n(...truncated)';
  }

  return result;
}
