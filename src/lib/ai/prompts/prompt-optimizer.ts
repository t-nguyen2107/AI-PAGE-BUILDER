/**
 * Prompt Optimizer — enriches raw user prompts before sending to AI.
 *
 * Zero latency, zero LLM cost — pure rule-based transformation.
 * Extracts business context, language, style, and intent from the raw prompt
 * and wraps it with structured metadata the AI can use immediately.
 */

// ---------------------------------------------------------------------------
// Industry / Business type mapping (Vietnamese + English → canonical type)
// ---------------------------------------------------------------------------
const INDUSTRY_MAP: Array<{ keywords: string[]; type: string; style: string }> = [
  // Vietnamese
  { keywords: ['tiệm bánh', 'bánh ngọt', 'bánh kem', 'patisserie'], type: 'bakery/pastry shop', style: 'warm, friendly, inviting, artisanal' },
  { keywords: ['nhà hàng', 'quán ăn', 'ẩm thực', 'mon ăn'], type: 'restaurant/dining', style: 'elegant, appetizing, warm' },
  { keywords: ['cà phê', 'quán cà phê', 'cafe', 'coffee shop'], type: 'coffee shop/cafe', style: 'cozy, modern, relaxed' },
  { keywords: ['spa', 'massage', 'thư giãn', 'wellness'], type: 'spa/wellness', style: 'calm, elegant, minimal, soothing' },
  { keywords: ['fitness', 'gym', 'thể hình', 'thể thao', 'phòng gym'], type: 'fitness/gym', style: 'energetic, bold, motivating' },
  { keywords: ['bất động sản', 'nhà đất', 'real estate', 'property'], type: 'real estate', style: 'professional, trustworthy, premium' },
  { keywords: ['giáo dục', 'trung tâm', 'khóa học', 'education', 'school'], type: 'education/training', style: 'clean, trustworthy, approachable' },
  { keywords: ['y tế', 'phòng khám', 'bệnh viện', 'clinic', 'medical', 'health'], type: 'healthcare/medical', style: 'clean, professional, calming, trustworthy' },
  { keywords: ['thời trang', 'quần áo', 'fashion', 'clothing', 'thời trang'], type: 'fashion/clothing', style: 'trendy, visual, elegant' },
  { keywords: ['du lịch', 'travel', 'tour', 'khách sạn', 'hotel', 'resort'], type: 'travel/hospitality', style: 'adventurous, vibrant, inviting' },
  { keywords: ['luật', 'pháp lý', 'law firm', 'legal', 'attorney'], type: 'law firm/legal', style: 'professional, authoritative, trustworthy' },
  { keywords: ['xây dựng', 'kiến trúc', 'construction', 'architecture'], type: 'construction/architecture', style: 'bold, structural, professional' },
  // English
  { keywords: ['saas', 'software', 'startup', 'app'], type: 'SaaS/technology', style: 'modern, clean, professional, tech-forward' },
  { keywords: ['portfolio', 'personal', 'resume', 'cv'], type: 'personal portfolio', style: 'minimal, creative, clean' },
  { keywords: ['agency', 'studio', 'creative'], type: 'creative agency', style: 'bold, artistic, modern' },
  { keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'online store'], type: 'e-commerce/store', style: 'clean, product-focused, trustworthy' },
  { keywords: ['blog', 'news', 'magazine', 'content'], type: 'blog/media', style: 'readable, clean, content-focused' },
  { keywords: ['charity', 'nonprofit', 'foundation', 'cause'], type: 'nonprofit/charity', style: 'warm, trustworthy, community-focused' },
  { keywords: ['event', 'conference', 'wedding', 'festival'], type: 'event/conference', style: 'vibrant, exciting, organized' },
  { keywords: ['crypto', 'blockchain', 'web3', 'nft', 'defi'], type: 'crypto/web3', style: 'futuristic, bold, dark-mode-friendly' },
];

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
type Intent = 'create_page' | 'add_section' | 'modify' | 'delete' | 'clarify' | 'unknown';

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
}

export function optimizePrompt(rawPrompt: string): OptimizedContext {
  const language = detectLanguage(rawPrompt);
  const intent = detectIntent(rawPrompt);
  const nameRefs = extractNameRefs(rawPrompt);

  // Detect business type
  let businessType: string | null = null;
  let inferredStyle: string | null = null;

  for (const industry of INDUSTRY_MAP) {
    if (industry.keywords.some(kw => rawPrompt.toLowerCase().includes(kw.toLowerCase()))) {
      businessType = industry.type;
      inferredStyle = industry.style;
      break;
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
      'User language: Vietnamese. Respond in Vietnamese for the "message" field, but use English for all content text, className values, and node data.',
    );
  } else if (language === 'mixed') {
    contextParts.push(
      'User language: Mixed Vietnamese/English. Respond in Vietnamese for the "message" field, but use English for all content text, className values, and node data.',
    );
  }

  const contextBlock =
    contextParts.length > 0
      ? `[Prompt Context: ${contextParts.join('. ')}]\n\n`
      : '';

  const enrichedPrompt = `${contextBlock}${rawPrompt}`;

  return {
    enrichedPrompt,
    businessType,
    style: finalStyle,
    language,
    intent,
    nameRefs,
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

  if (typeof n.name === 'string' && typeof n.id === 'string') {
    acc.set(n.name, n.id);
  }

  // Recurse into children
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
