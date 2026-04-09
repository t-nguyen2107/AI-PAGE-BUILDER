/**
 * Prompt Optimizer — enriches raw user prompts before sending to AI.
 *
 * Zero latency, zero LLM cost — pure rule-based transformation.
 * Extracts business context, language, style, and intent from the raw prompt
 * and wraps it with structured metadata the AI can use immediately.
 *
 * Now enriched with design knowledge: color palettes, typography, landing
 * patterns, and style recommendations tailored to the detected business type.
 */

import {
  resolveDesignGuidance,
  formatDesignGuidance,
  type DesignGuidance,
} from '../knowledge/design-knowledge';
import { detectBusinessType } from '../knowledge/business-detect';

// ---------------------------------------------------------------------------
// Style keyword mapping
// ---------------------------------------------------------------------------
const STYLE_MAP: Record<string, string> = {
  // Vietnamese
  'hiện đại': 'modern',
  'tối giản': 'minimal',
  'sang trọng': 'elegant',
  'ấm cúng': 'cozy',
  'chuyên nghiệp': 'professional',
  'đẹp': 'beautiful',
  'tươi sáng': 'fresh/bright',
  'tối': 'dark',
  'sắc nét': 'sharp',
  // English
  'modern': 'modern',
  'minimal': 'minimal',
  'minimalist': 'minimal',
  'elegant': 'elegant',
  'bold': 'bold',
  'dark': 'dark',
  'playful': 'playful',
  'luxury': 'luxury',
  'premium': 'premium',
  'corporate': 'corporate',
  'creative': 'creative',
  'retro': 'retro',
  'vintage': 'vintage',
};

// ---------------------------------------------------------------------------
// Language detection
// ---------------------------------------------------------------------------
function detectLanguage(prompt: string): 'vi' | 'en' | 'mixed' {
  const vietnameseMarkers = /[àáạảãăằắặẳẵâèéẹẻẽêìíịỉĩòóọỏõôùúụủũưừứửữựỳýỵỷ]/g;
  const matches = prompt.match(vietnameseMarkers);
  if (matches && matches.length >= 2) {
    // Check if also has significant English
    const englishWords = prompt.match(/\b[a-zA-Z]{3,}\b/g);
    if (englishWords && englishWords.length >= 3) return 'mixed';
    return 'vi';
  }
  return 'en';
}

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------
type Intent = 'create_page' | 'add_section' | 'modify' | 'delete' | 'unknown';

function detectIntent(prompt: string): Intent {
  const lower = prompt.toLowerCase();

  // Full page creation
  const pageKeywords = ['landing page', 'website', 'trang web', 'toàn trang', 'full page', 'tạo trang', 'tạo website'];
  if (pageKeywords.some(kw => lower.includes(kw))) return 'create_page';

  // Add section
  const addKeywords = ['thêm', 'add', 'tạo', 'create', 'insert', 'generate', 'thêm section', 'thêm phần'];
  if (addKeywords.some(kw => lower.includes(kw))) return 'add_section';

  // Modify
  const modifyKeywords = ['sửa', 'thay đổi', 'change', 'modify', 'update', 'edit', 'style', 'đổi màu', 'đổi font'];
  if (modifyKeywords.some(kw => lower.includes(kw))) return 'modify';

  // Delete
  const deleteKeywords = ['xóa', 'remove', 'delete'];
  if (deleteKeywords.some(kw => lower.includes(kw))) return 'delete';

  return 'unknown';
}

// ---------------------------------------------------------------------------
// @name reference extraction
// ---------------------------------------------------------------------------
const NAME_REF_RE = /@([a-z][a-z0-9_]*)/gi;

function extractNameRefs(prompt: string): string[] {
  const refs: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(NAME_REF_RE.source, NAME_REF_RE.flags);
  while ((match = re.exec(prompt)) !== null) {
    refs.push(match[1]);
  }
  return [...new Set(refs)]; // deduplicate
}

// ---------------------------------------------------------------------------
// Main optimizer
// ---------------------------------------------------------------------------
export interface OptimizedContext {
  /** The enriched prompt to send to the AI */
  enrichedPrompt: string;
  /** Detected business type (for logging/debugging) */
  businessType: string | null;
  /** Detected style preference */
  style: string | null;
  /** Detected language */
  language: 'vi' | 'en' | 'mixed';
  /** Detected intent */
  intent: Intent;
  /** @name references extracted from prompt (e.g., ["hero_heading", "cta_buy"]) */
  nameRefs: string[];
  /** Resolved design guidance (colors, style, pattern, typography, reasoning) */
  designGuidance: DesignGuidance | null;
  /** Compact design guidance text for prompt injection */
  designContext: string | null;
}

export function optimizePrompt(rawPrompt: string): OptimizedContext {
  const language = detectLanguage(rawPrompt);
  const intent = detectIntent(rawPrompt);
  const nameRefs = extractNameRefs(rawPrompt);

  // Detect business type — uses shared keyword map (single source of truth)
  const businessType: string | null = detectBusinessType(rawPrompt);

  // Derive style from design guidance (PRODUCT_REASONING)
  let inferredStyle: string | null = null;
  if (businessType) {
    const guidance = resolveDesignGuidance(businessType);
    if (guidance) {
      inferredStyle = guidance.reasoning.stylePriority;
    }
  }

  // Detect explicit style keywords
  let explicitStyle: string | null = null;
  for (const [keyword, style] of Object.entries(STYLE_MAP)) {
    if (rawPrompt.toLowerCase().includes(keyword.toLowerCase())) {
      explicitStyle = style;
      break;
    }
  }

  const finalStyle = explicitStyle ?? inferredStyle;

  // Resolve design guidance from knowledge base
  const designGuidance = resolveDesignGuidance(businessType);
  const designContext = designGuidance ? formatDesignGuidance(designGuidance, businessType ?? undefined) : null;

  // Build context prefix
  const contextParts: string[] = [];

  if (businessType) {
    contextParts.push(`Business type: ${businessType}`);
  }

  if (finalStyle) {
    contextParts.push(`Design style: ${finalStyle}`);
  }

  if (language === 'vi') {
    contextParts.push(
      'User language: Vietnamese. ALL visible content (headings, subtext, descriptions, button labels, quotes, FAQ answers, team roles, product descriptions) MUST be in Vietnamese. Use English ONLY for structural JSON keys (type, action, id, href, className, component type names).',
    );
  } else if (language === 'mixed') {
    contextParts.push(
      'User language: Mixed Vietnamese/English. ALL visible content (headings, subtext, descriptions, button labels, quotes, FAQ answers) MUST be in Vietnamese. Use English ONLY for structural JSON keys (type, action, id, href, className, component type names).',
    );
  }

  const contextBlock =
    contextParts.length > 0
      ? `[Prompt Context: ${contextParts.join('. ')}]\n\n`
      : '';

  // Design context is injected separately via designContext/designGuidance in section-prompt.ts
  // No need to append it to enrichedPrompt to avoid duplication
  const enrichedPrompt = `${contextBlock}${rawPrompt}`;

  return {
    enrichedPrompt,
    businessType,
    style: finalStyle,
    language,
    intent,
    nameRefs,
    designGuidance,
    designContext,
  };
}

// ---------------------------------------------------------------------------
// Resolve @name references → targetNodeId from tree data
// ---------------------------------------------------------------------------

/**
 * Walk the tree recursively and collect all { name, id } pairs.
 */
function collectNodeNames(node: unknown, acc: Map<string, string>): void {
  if (!node || typeof node !== 'object') return;
  const n = node as Record<string, unknown>;

  // Puck ComponentData: { type, props: { id, name } }
  const props = typeof n.props === 'object' && n.props !== null ? n.props as Record<string, unknown> : null;
  if (props) {
    const name = typeof props.name === 'string' ? props.name : '';
    const id = typeof props.id === 'string' ? props.id : '';
    if (name && id) {
      acc.set(name, id);
    }
  }

  // Legacy format: node.name + node.id
  if (typeof n.name === 'string' && typeof n.id === 'string') {
    acc.set(n.name, n.id);
  }

  // Recurse into content array (Puck flat list)
  if (Array.isArray(n.content)) {
    for (const child of n.content) {
      collectNodeNames(child, acc);
    }
  }

  // Recurse into children (legacy tree)
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      collectNodeNames(child, acc);
    }
  }

  // Also check treeData if it's a page-like root
  if (n.treeData && typeof n.treeData === 'object') {
    collectNodeNames(n.treeData, acc);
  }
}

/**
 * Resolve a list of @name references to the first matching node ID.
 * Returns the ID of the first match, or undefined if none found.
 */
export function resolveNameToId(
  treeData: unknown,
  nameRefs: string[],
): string | undefined {
  if (!nameRefs.length || !treeData) return undefined;

  const nameMap = new Map<string, string>();
  collectNodeNames(treeData, nameMap);

  for (const ref of nameRefs) {
    // Try exact match first
    const exact = nameMap.get(ref);
    if (exact) return exact;
    // Try case-insensitive match
    for (const [name, id] of nameMap) {
      if (name.toLowerCase() === ref.toLowerCase()) return id;
    }
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Dynamic Component Catalog — Tier Selection
// ---------------------------------------------------------------------------

/** Component names that are always included with full detail (structural + atomic) */
const STRUCTURAL_COMPONENTS = [
  'SectionBlock', 'Flex', 'Grid', 'ColumnsLayout', 'Spacer', 'Blank',
  'HeadingBlock', 'TextBlock', 'ButtonBlock', 'ImageBlock', 'CardBlock', 'RichTextBlock',
  'HeaderNav', 'FooterSection',
];

/** All content section component names */
const CONTENT_COMPONENTS = [
  'HeroSection', 'FeaturesGrid', 'PricingTable', 'TestimonialSection',
  'CTASection', 'FAQSection', 'StatsSection', 'TeamSection', 'BlogSection', 'LogoGrid',
  'ContactForm', 'NewsletterSignup', 'Gallery', 'SocialProof', 'ComparisonTable',
  'ProductCards', 'FeatureShowcase', 'CountdownTimer', 'AnnouncementBar', 'Banner',
];

/**
 * Maps detected business type → most relevant content components.
 * Components listed here get Tier 1 (full detail) for create_page intent.
 */
const BUSINESS_COMPONENT_RELEVANCE: Record<string, string[]> = {
  'bakery/pastry shop':        ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'FAQSection', 'ContactForm'],
  'restaurant/dining':         ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'FAQSection', 'ContactForm', 'AnnouncementBar'],
  'coffee shop/cafe':          ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'FAQSection', 'ContactForm', 'AnnouncementBar'],
  'SaaS/technology':           ['HeroSection', 'FeaturesGrid', 'PricingTable', 'TestimonialSection', 'FAQSection', 'StatsSection', 'LogoGrid', 'CTASection', 'ComparisonTable', 'FeatureShowcase'],
  'personal portfolio':        ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'ContactForm', 'FeatureShowcase'],
  'creative agency':           ['HeroSection', 'FeaturesGrid', 'Gallery', 'TestimonialSection', 'LogoGrid', 'CTASection', 'TeamSection', 'ContactForm'],
  'e-commerce/store':          ['HeroSection', 'ProductCards', 'TestimonialSection', 'NewsletterSignup', 'FAQSection', 'CTASection', 'AnnouncementBar', 'SocialProof'],
  'blog/media':                ['HeroSection', 'BlogSection', 'NewsletterSignup', 'CTASection'],
  'spa/wellness':              ['HeroSection', 'Gallery', 'TestimonialSection', 'PricingTable', 'CTASection', 'FAQSection', 'ContactForm'],
  'fitness/gym':               ['HeroSection', 'FeaturesGrid', 'PricingTable', 'TestimonialSection', 'StatsSection', 'CTASection', 'Gallery'],
  'real estate':               ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'ContactForm', 'FeatureShowcase', 'StatsSection'],
  'education/training':        ['HeroSection', 'FeaturesGrid', 'TestimonialSection', 'PricingTable', 'FAQSection', 'CTASection', 'TeamSection'],
  'healthcare/medical':        ['HeroSection', 'FeaturesGrid', 'TestimonialSection', 'FAQSection', 'CTASection', 'ContactForm', 'TeamSection'],
  'fashion/clothing':          ['HeroSection', 'ProductCards', 'Gallery', 'TestimonialSection', 'NewsletterSignup', 'CTASection', 'AnnouncementBar'],
  'travel/hospitality':        ['HeroSection', 'Gallery', 'TestimonialSection', 'CTASection', 'FAQSection', 'ContactForm', 'FeatureShowcase', 'PricingTable'],
  'law firm/legal':            ['HeroSection', 'FeaturesGrid', 'TestimonialSection', 'TeamSection', 'CTASection', 'FAQSection', 'ContactForm'],
  'construction/architecture': ['HeroSection', 'FeaturesGrid', 'Gallery', 'TestimonialSection', 'CTASection', 'ContactForm', 'StatsSection'],
  'nonprofit/charity':         ['HeroSection', 'FeaturesGrid', 'StatsSection', 'TestimonialSection', 'CTASection', 'FAQSection', 'ContactForm'],
  'event/conference':          ['HeroSection', 'FeaturesGrid', 'CountdownTimer', 'TestimonialSection', 'CTASection', 'FAQSection', 'Banner', 'AnnouncementBar'],
  'crypto/web3':               ['HeroSection', 'FeaturesGrid', 'StatsSection', 'FAQSection', 'CTASection', 'CountdownTimer', 'ComparisonTable'],
};

export interface ComponentTierPlan {
  /** Components with full prop documentation */
  fullDetail: string[];
  /** Components with name + short description */
  summary: string[];
  /** Components listed by name only */
  nameOnly: string[];
}

/** Default set when no business type detected */
const DEFAULT_PAGE_COMPONENTS = [
  'HeroSection', 'FeaturesGrid', 'TestimonialSection',
  'PricingTable', 'FAQSection', 'CTASection', 'ContactForm',
];

/**
 * Select which components get which detail tier based on intent, business type, and current page.
 */
export function selectRelevantComponents(
  intent: Intent,
  businessType: string | null,
  treeSummary?: string,
): ComponentTierPlan {
  // --- create_page: full detail for structural + relevant content, summary for rest ---
  if (intent === 'create_page') {
    const businessRelevant = businessType
      ? (BUSINESS_COMPONENT_RELEVANCE[businessType] ?? [])
      : [];
    const primary = businessRelevant.length > 0 ? businessRelevant : DEFAULT_PAGE_COMPONENTS;

    const fullDetail = [...new Set([...STRUCTURAL_COMPONENTS, ...primary])];
    return {
      fullDetail,
      summary: CONTENT_COMPONENTS.filter(c => !fullDetail.includes(c)),
      nameOnly: [],
    };
  }

  // --- add_section: structural full, all content as summary ---
  if (intent === 'add_section') {
    return {
      fullDetail: [...STRUCTURAL_COMPONENTS],
      summary: [...CONTENT_COMPONENTS],
      nameOnly: [],
    };
  }

  // --- modify/delete: structural + components on page get full detail ---
  if (intent === 'modify' || intent === 'delete') {
    const onPageComponents = extractComponentTypesFromTree(treeSummary);
    const fullDetail = [...new Set([...STRUCTURAL_COMPONENTS, ...onPageComponents])];
    return {
      fullDetail,
      summary: CONTENT_COMPONENTS.filter(c => !fullDetail.includes(c)),
      nameOnly: [],
    };
  }

  // --- unknown/clarify: minimal prompt ---
  return {
    fullDetail: [...STRUCTURAL_COMPONENTS],
    summary: [],
    nameOnly: [...CONTENT_COMPONENTS],
  };
}

/**
 * Parse component type names from treeSummary string.
 * Format: "1. HeroSection (id: \"comp_abc\") ..."
 */
function extractComponentTypesFromTree(treeSummary?: string): string[] {
  if (!treeSummary) return [];
  const types: string[] = [];
  for (const line of treeSummary.split('\n')) {
    const match = line.match(/\d+\.\s+(\w+)/);
    if (match) types.push(match[1]);
  }
  return [...new Set(types)];
}
