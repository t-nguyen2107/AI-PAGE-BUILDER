import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { aiResponseJsonSchema } from './schemas/ai-response.schema';
import { AIAction } from '@/types/enums';
import type { AIGenerationResponse } from '@/types/ai';

const VALID_ACTIONS = new Set<string>(Object.values(AIAction));

/**
 * Wrap a chat model with structured output enforcement.
 * Uses JSON Schema (not Zod) to avoid Zod 3/4 version conflict.
 */
export function createStructuredModel(model: BaseChatModel) {
  return model.withStructuredOutput(aiResponseJsonSchema, {
    name: 'ai_generation_response',
  });
}

/**
 * Post-validate structured output with a lenient check.
 *
 * LangChain's withStructuredOutput already enforces the JSON Schema shape.
 * Here we only validate the essential top-level fields — NOT the recursive
 * DOMNode structure. The store's applyAIDiff handles node-level validation.
 */
const THINK_TAG_RE = /<think[\s\S]*?<\/think>/gi;
const THINK_CAPTURE_RE = /<think[^>]*>([\s\S]*?)<\/think>/gi;

/** Strip <think/> tags that some models emit (e.g., Qwen 3, DeepSeek-R1) */
function stripThinkTags(text: string): string {
  return text.replace(THINK_TAG_RE, '');
}

/**
 * Extract reasoning content from <think/> tags and return both
 * the reasoning text and the cleaned text without think tags.
 */
export function extractReasoning(text: string): { reasoning: string | null; cleaned: string } {
  const reasoningParts: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(THINK_CAPTURE_RE.source, THINK_CAPTURE_RE.flags);
  while ((match = re.exec(text)) !== null) {
    const content = match[1]?.trim();
    if (content) reasoningParts.push(content);
  }
  const reasoning = reasoningParts.length > 0 ? reasoningParts.join('\n') : null;
  const cleaned = text.replace(THINK_TAG_RE, '').trim();
  return { reasoning, cleaned };
}

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

  // Handle "clarify" action — message is required, nodes are empty
  if (obj.action === 'clarify') {
    const rawMsg = typeof obj.message === 'string' ? obj.message : '';
    const message = stripThinkTags(rawMsg).trim();
    if (!message) {
      return { data: null, error: 'Clarify action requires a "message" field with questions for the user' };
    }
    return {
      data: {
        action: AIAction.CLARIFY,
        nodes: [],
        message,
      },
      error: null,
    };
  }

  // Validate nodes is an array for all non-clarify actions
  if (!Array.isArray(obj.nodes)) {
    return { data: null, error: 'Missing or invalid "nodes" — must be an array' };
  }

  // Build clean response — normalize nulls and ensure basic node shape
  const nodes = obj.nodes.map((node: unknown, i: number) => {
    if (!node || typeof node !== 'object') {
      return { id: `n_ai_${i}`, type: 'element', tag: 'div', className: '' };
    }
    const n = node as Record<string, unknown>;
    return {
      ...n,
      id: typeof n.id === 'string' && n.id ? n.id : `n_ai_${i}`,
      type: typeof n.type === 'string' ? n.type : 'element',
      tag: typeof n.tag === 'string' ? n.tag : 'div',
    };
  });

  return {
    data: {
      action: obj.action as AIAction,
      nodes: nodes as AIGenerationResponse['nodes'],
      targetNodeId: typeof obj.targetNodeId === 'string' ? obj.targetNodeId : undefined,
      position: typeof obj.position === 'number' ? obj.position : undefined,
      message: typeof obj.message === 'string' ? stripThinkTags(obj.message).trim() : undefined,
    },
    error: null,
  };
}
