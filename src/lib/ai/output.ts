import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { aiResponseJsonSchema } from './schemas/ai-response.schema';
import { AIAction } from '@/types/enums';
import type { AIGenerationResponse } from '@/types/ai';
import type { ComponentData } from '@puckeditor/core';

const VALID_ACTIONS = new Set<string>(Object.values(AIAction));

/** Known Puck component type names */
const VALID_COMPONENT_TYPES = new Set([
  // Sections
  'HeroSection',
  'FeaturesGrid',
  'PricingTable',
  'TestimonialSection',
  'CTASection',
  'FAQSection',
  'StatsSection',
  'TeamSection',
  'BlogSection',
  'LogoGrid',
  'ContactForm',
  'HeaderNav',
  'FooterSection',
  'NewsletterSignup',
  'Gallery',
  'SocialProof',
  'ComparisonTable',
  'ProductCards',
  'FeatureShowcase',
  'CountdownTimer',
  'AnnouncementBar',
  'Banner',
  // Atomic / layout
  'TextBlock',
  'HeadingBlock',
  'RichTextBlock',
  'ImageBlock',
  'ButtonBlock',
  'CardBlock',
  'Spacer',
  'ColumnsLayout',
  'SectionBlock',
  'Blank',
  'Flex',
  'Grid',
  // Custom
  'CustomSection',
]);

/**
 * Wrap a chat model with structured output enforcement.
 * Uses JSON Schema (not Zod) to avoid Zod 3/4 version conflict.
 */
export function createStructuredModel(model: BaseChatModel) {
  return model.withStructuredOutput(aiResponseJsonSchema, {
    name: 'ai_generation_response',
  });
}

const THINK_TAG_RE = /<think[\s\S]*?<\/think>/gi;

function stripThinkTags(text: string): string {
  return text.replace(THINK_TAG_RE, '');
}

/**
 * Validate AI output as Puck ComponentData.
 */
export function validateOutput(raw: unknown): {
  data: AIGenerationResponse | null;
  error: string | null;
} {
  if (!raw || typeof raw !== 'object') {
    return { data: null, error: 'AI response is not a valid object' };
  }

  const obj = raw as Record<string, unknown>;

  // Validate action
  if (!obj.action || typeof obj.action !== 'string' || !VALID_ACTIONS.has(obj.action)) {
    return { data: null, error: `Invalid or missing "action": "${obj.action}"` };
  }

  // Handle "clarify" action
  if (obj.action === 'clarify') {
    const rawMsg = typeof obj.message === 'string' ? obj.message : '';
    const message = stripThinkTags(rawMsg).trim();
    if (!message) {
      return { data: null, error: 'Clarify action requires a "message" field' };
    }
    return {
      data: {
        action: AIAction.CLARIFY,
        components: [],
        message,
      },
      error: null,
    };
  }

  // Extract components — support both "components" and legacy "nodes" fields
  let rawComponents: unknown[] = [];

  if (Array.isArray(obj.components)) {
    rawComponents = obj.components;
  } else if (Array.isArray(obj.nodes)) {
    // Legacy format — old AI may still output "nodes"
    rawComponents = obj.nodes;
  }

  if (rawComponents.length === 0 && obj.action !== 'delete_node') {
    return { data: null, error: 'Missing "components" array' };
  }

  // Validate and normalize each component
  const components: ComponentData[] = rawComponents.map((comp, i) => {
    if (!comp || typeof comp !== 'object') {
      return {
        type: 'TextBlock',
        props: { id: `comp_${i}`, content: '<p>Generated content</p>', align: 'left', maxWidth: 'lg' },
      };
    }
    const c = comp as Record<string, unknown>;
    const type = typeof c.type === 'string' ? c.type : 'TextBlock';
    const props = (c.props as Record<string, unknown>) ?? {};

    // Ensure id exists
    if (!props.id || typeof props.id !== 'string') {
      props.id = `comp_${Date.now()}_${i}`;
    }

    // Strip emojis from text props
    for (const key of ['heading', 'subtext', 'message', 'content', 'question', 'answer', 'quote', 'excerpt']) {
      if (typeof props[key] === 'string') {
        props[key] = stripEmojis(props[key] as string);
      }
    }

    // Warn about unknown types but don't reject
    if (!VALID_COMPONENT_TYPES.has(type)) {
      console.warn(`[output] Unknown component type: "${type}"`);
    }

    return { type, props } as ComponentData;
  });

  return {
    data: {
      action: obj.action as AIAction,
      components,
      targetComponentId: typeof obj.targetComponentId === 'string' ? obj.targetComponentId : undefined,
      position: typeof obj.position === 'number' ? obj.position : undefined,
      message: typeof obj.message === 'string' ? stripThinkTags(obj.message).trim() : undefined,
    },
    error: null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

function stripEmojis(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}
