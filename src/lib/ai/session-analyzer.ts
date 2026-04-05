/**
 * Session Analyzer — rule-based insight extraction from AI chat sessions.
 *
 * Runs AFTER each streaming response completes (fire-and-forget).
 * Zero additional LLM cost — uses pattern matching rules.
 */

import { prisma } from '@/lib/prisma';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExtractedInsight {
  category: 'preference' | 'correction' | 'pattern' | 'fact' | 'instruction';
  content: string;
  confidence: number; // 0-1
  profileField?: keyof ProfileUpdateFields;
  profileValue?: string;
}

export interface ProfileUpdateFields {
  businessType?: string;
  businessName?: string;
  industry?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
}

// ─── Industry keywords ────────────────────────────────────────────────────────

const INDUSTRY_KEYWORDS: Record<string, { type: string; industry: string; tone: string }> = {
  // Vietnamese
  'tiệm bánh': { type: 'Bakery', industry: 'food', tone: 'warm, friendly' },
  'tiệm cà phê': { type: 'Coffee Shop', industry: 'food', tone: 'warm, cozy' },
  'quán ăn': { type: 'Restaurant', industry: 'food', tone: 'warm, inviting' },
  'spa': { type: 'Spa & Wellness', industry: 'wellness', tone: 'calm, luxurious' },
  'phòng khám': { type: 'Clinic', industry: 'healthcare', tone: 'professional, caring' },
  'công ty': { type: 'Company', industry: 'business', tone: 'professional' },
  'trường': { type: 'School', industry: 'education', tone: 'friendly, informative' },
  // English
  'coffee shop': { type: 'Coffee Shop', industry: 'food', tone: 'warm, cozy' },
  'bakery': { type: 'Bakery', industry: 'food', tone: 'warm, friendly' },
  'restaurant': { type: 'Restaurant', industry: 'food', tone: 'warm, inviting' },
  'saas': { type: 'SaaS', industry: 'technology', tone: 'modern, clean' },
  'startup': { type: 'Startup', industry: 'technology', tone: 'modern, dynamic' },
  'agency': { type: 'Agency', industry: 'services', tone: 'creative, professional' },
  'portfolio': { type: 'Portfolio', industry: 'creative', tone: 'minimal, elegant' },
  'ecommerce': { type: 'E-Commerce', industry: 'retail', tone: 'bold, engaging' },
  'blog': { type: 'Blog', industry: 'media', tone: 'conversational' },
  'landing page': { type: 'Landing Page', industry: 'marketing', tone: 'persuasive, clear' },
};

// ─── Style keywords ───────────────────────────────────────────────────────────

const STYLE_MAP: Record<string, string> = {
  'hiện đại': 'modern',
  'tối giản': 'minimal',
  'sang trọng': 'elegant',
  'professional': 'professional',
  'modern': 'modern',
  'minimal': 'minimal',
  'elegant': 'elegant',
  'bold': 'bold',
  'playful': 'playful',
  'creative': 'creative',
  'luxury': 'luxury',
};

// ─── Vietnamese detection ────────────────────────────────────────────────────

export function isVietnamese(text: string): boolean {
  const vietnameseMarks = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗùúụủũưừứựửữỳýỵỷỹđĐ]/g;
  const matches = text.match(vietnameseMarks);
  return (matches?.length ?? 0) >= 2;
}

// ─── Component tracking ──────────────────────────────────────────────────────

const COMPONENT_TYPE_RE = /"type"\s*:\s*"(\w+)"/g;

export function extractComponentTypes(responseJson: string): string[] {
  const types: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = COMPONENT_TYPE_RE.exec(responseJson)) !== null) {
    types.push(match[1]);
  }
  return types;
}

// ─── Main analysis function ──────────────────────────────────────────────────

/**
 * Analyze a session's messages and extract structured insights.
 */
export async function analyzeSession(
  _projectId: string,
  sessionId: string,
): Promise<ExtractedInsight[]> {
  const messages = await prisma.aISessionMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  if (messages.length === 0) return [];

  const insights: ExtractedInsight[] = [];
  const userMessages = messages.filter((m) => m.role === 'user');
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  // 1. Detect language from first user message
  if (userMessages.length > 0) {
    const firstMsg = userMessages[0].content;
    if (isVietnamese(firstMsg)) {
      insights.push({
        category: 'instruction',
        content: 'User communicates in Vietnamese',
        confidence: 0.9,
        profileField: 'language',
        profileValue: 'vi',
      });
    }
  }

  // 2. Detect industry/business type from prompts
  for (const msg of userMessages) {
    const lower = msg.content.toLowerCase();
    for (const [keyword, data] of Object.entries(INDUSTRY_KEYWORDS)) {
      // Use word boundary matching to avoid false positives (e.g., "spa" matching "spacious")
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        insights.push({
          category: 'fact',
          content: `Business identified as: ${data.type} (${data.industry})`,
          confidence: 0.85,
          profileField: 'businessType',
          profileValue: data.type,
        });
        // Also suggest industry and tone
        insights.push({
          category: 'fact',
          content: `Industry: ${data.industry}`,
          confidence: 0.8,
          profileField: 'industry',
          profileValue: data.industry,
        });
        insights.push({
          category: 'preference',
          content: `Suggested tone: ${data.tone}`,
          confidence: 0.6,
          profileField: 'tone',
          profileValue: data.tone,
        });
        break; // Only match first industry keyword per message
      }
    }
  }

  // 3. Detect style preferences
  for (const msg of userMessages) {
    const lower = msg.content.toLowerCase();
    for (const [keyword, style] of Object.entries(STYLE_MAP)) {
      if (lower.includes(keyword)) {
        insights.push({
          category: 'preference',
          content: `User prefers ${style} design style`,
          confidence: 0.8,
          profileField: 'preferredStyle',
          profileValue: style,
        });
        break;
      }
    }
  }

  // 4. Detect corrections (user modifies right after generation)
  for (let i = 1; i < userMessages.length; i++) {
    const msg = userMessages[i].content.toLowerCase();
    const isCorrection =
      msg.includes('change') || msg.includes('sửa') ||
      msg.includes('thay') || msg.includes('modify') ||
      msg.includes('update') || msg.includes('replace') ||
      msg.includes('khác') || msg.includes('instead') ||
      msg.includes('not that') || msg.includes('no, ');

    if (isCorrection) {
      insights.push({
        category: 'correction',
        content: `User corrected: "${userMessages[i].content.slice(0, 100)}"`,
        confidence: 0.7,
      });
    }
  }

  // 5. Track component usage patterns
  const allComponentTypes: string[] = [];
  for (const msg of assistantMessages) {
    allComponentTypes.push(...extractComponentTypes(msg.content));
  }
  if (allComponentTypes.length > 0) {
    const counts: Record<string, number> = {};
    for (const t of allComponentTypes) {
      counts[t] = (counts[t] || 0) + 1;
    }
    const topTypes = Object.entries(counts)
      .filter(([, c]) => c >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (topTypes.length > 0) {
      insights.push({
        category: 'pattern',
        content: `Component usage: ${topTypes.map(([t, c]) => `${t}(${c}x)`).join(', ')}`,
        confidence: 0.75,
      });
    }
  }

  return insights;
}
