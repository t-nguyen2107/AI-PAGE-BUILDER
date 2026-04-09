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

// ---------------------------------------------------------------------------
// Industry / Business type mapping (Vietnamese + English → canonical type)
// ---------------------------------------------------------------------------
const INDUSTRY_MAP: Array<{ keywords: string[]; type: string; style: string }> = [
  // Vietnamese
  { keywords: ['tiệm bánh', 'bánh ngọt', 'bánh kem', 'patisserie'], type: 'bakery/pastry shop', style: 'warm, friendly, inviting, artisanal' },
  { keywords: ['nhà hàng', 'quán ăn', 'ẩm thực', 'món ăn'], type: 'restaurant/dining', style: 'elegant, appetizing, warm' },
  { keywords: ['cà phê', 'quán cà phê', 'cafe', 'coffee shop'], type: 'coffee shop/cafe', style: 'cozy, modern, relaxed' },
  { keywords: ['spa', 'massage', 'thư giãn', 'wellness'], type: 'spa/wellness', style: 'calm, elegant, minimal, soothing' },
  { keywords: ['fitness', 'gym', 'thể hình', 'thể thao', 'phòng gym'], type: 'fitness/gym', style: 'energetic, bold, motivating' },
  { keywords: ['bất động sản', 'nhà đất', 'real estate', 'property'], type: 'real estate', style: 'professional, trustworthy, premium' },
  { keywords: ['giáo dục', 'trung tâm', 'khóa học', 'education', 'school'], type: 'education/training', style: 'clean, trustworthy, approachable' },
  { keywords: ['y tế', 'phòng khám', 'bệnh viện', 'clinic', 'medical', 'health'], type: 'healthcare/medical', style: 'clean, professional, calming, trustworthy' },
  { keywords: ['thời trang', 'quần áo', 'fashion', 'clothing'], type: 'fashion/clothing', style: 'trendy, visual, elegant' },
  { keywords: ['du lịch', 'travel', 'tour', 'khách sạn', 'hotel', 'resort'], type: 'travel/hospitality', style: 'adventurous, vibrant, inviting' },
  { keywords: ['luật', 'pháp lý', 'law firm', 'legal', 'attorney'], type: 'law firm/legal', style: 'professional, authoritative, trustworthy' },
  { keywords: ['xây dựng', 'kiến trúc', 'construction', 'architecture'], type: 'construction/architecture', style: 'bold, structural, professional' },
  // English — Tech & SaaS
  { keywords: ['saas', 'software', 'startup', 'app'], type: 'SaaS/technology', style: 'modern, clean, professional, tech-forward' },
  { keywords: ['micro saas', 'indie hacker', 'bootstrap'], type: 'Micro SaaS', style: 'modern, clean, professional' },
  { keywords: ['b2b', 'enterprise', 'business service'], type: 'B2B', style: 'professional, trustworthy, navy' },
  { keywords: ['ai', 'chatbot', 'artificial intelligence', 'machine learning', 'llm'], type: 'AI/Chatbot Platform', style: 'futuristic, purple, intelligent' },
  { keywords: ['developer', 'ide', 'code', 'dev tool', 'programming'], type: 'Developer Tool / IDE', style: 'technical, dark, precise' },
  { keywords: ['cybersecurity', 'security', 'vpn', 'privacy'], type: 'Cybersecurity Platform', style: 'dark, professional, secure' },
  { keywords: ['analytics', 'dashboard', 'data visualization', 'bi', 'business intelligence'], type: 'Analytics', style: 'clean, data-focused, blue' },
  { keywords: ['crm', 'client management', 'sales pipeline'], type: 'CRM & Client Management', style: 'professional, clean, trustworthy' },
  { keywords: ['productivity', 'task', 'project management', 'collaboration', 'remote work'], type: 'Productivity', style: 'clean, teal, focused' },
  { keywords: ['design system', 'component library', 'ui kit'], type: 'Design System/Component Library', style: 'indigo, systematic, documented' },
  // English — Finance
  { keywords: ['fintech', 'finance', 'banking', 'investment', 'trading'], type: 'Fintech/Crypto', style: 'dark, professional, green indicators' },
  { keywords: ['financial dashboard', 'trading', 'stock', 'portfolio'], type: 'Financial', style: 'dark, green positive, data-dense' },
  { keywords: ['insurance', 'coverage', 'policy'], type: 'Insurance Platform', style: 'professional, trustworthy, navy' },
  { keywords: ['personal finance', 'budget', 'expense', 'money management'], type: 'Personal Finance Tracker', style: 'clean, green, trustworthy' },
  // English — Commerce
  { keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'online store'], type: 'e-commerce/store', style: 'clean, product-focused, trustworthy' },
  { keywords: ['luxury', 'premium', 'high-end', 'luxe'], type: 'Luxury/Premium Brand', style: 'dark, gold, sophisticated' },
  { keywords: ['marketplace', 'peer-to-peer', 'p2p', 'platform'], type: 'Marketplace (P2P)', style: 'vibrant, trustworthy, clean' },
  { keywords: ['subscription', 'subscription box', 'box service'], type: 'Subscription Box Service', style: 'vibrant, playful, engaging' },
  { keywords: ['food delivery', 'delivery', 'on-demand', 'takeout'], type: 'Food Delivery / On-Demand', style: 'appetizing, fast, urgent' },
  { keywords: ['grocery', 'supermarket'], type: 'Grocery & Shopping List', style: 'fresh, green, organized' },
  // English — Content & Media
  { keywords: ['blog', 'news', 'magazine', 'content'], type: 'blog/media', style: 'readable, clean, content-focused' },
  { keywords: ['podcast', 'podcast platform'], type: 'Podcast Platform', style: 'dark, warm accent, audio' },
  { keywords: ['video streaming', 'ott', 'netflix', 'streaming', 'video platform'], type: 'Video Streaming/OTT', style: 'dark, cinematic, immersive' },
  { keywords: ['music streaming', 'music', 'spotify', 'audio'], type: 'Music Streaming', style: 'dark, warm accent, immersive' },
  { keywords: ['newsletter', 'email newsletter', 'substack'], type: 'Newsletter Platform', style: 'clean, readable, content-focused' },
  // English — Social & Community
  { keywords: ['social media', 'social network', 'community'], type: 'Social Media', style: 'vibrant, engaging, rose' },
  { keywords: ['dating', 'dating app', 'match', 'tinder'], type: 'Dating', style: 'warm, inviting, playful' },
  { keywords: ['creator', 'creator economy', 'influencer', 'youtube', 'tiktok'], type: 'Creator Economy', style: 'bold, pink, creative' },
  { keywords: ['membership', 'community platform', 'forum'], type: 'Membership/Community', style: 'warm, trustworthy, connected' },
  // English — Health & Wellness
  { keywords: ['mental health', 'therapy', 'counseling', 'psychologist'], type: 'Mental Health', style: 'calm, safe, soothing' },
  { keywords: ['meditation', 'mindfulness', 'calm', 'headspace'], type: 'Meditation & Mindfulness', style: 'serene, calm, minimal' },
  { keywords: ['dental', 'dentist', 'ortho', 'teeth'], type: 'Dental Practice', style: 'clean, professional, trustworthy' },
  { keywords: ['pharmacy', 'drug store', 'medicine', 'medication'], type: 'Pharmacy/Drug Store', style: 'clean, professional, green' },
  { keywords: ['veterinary', 'vet', 'pet clinic', 'animal hospital'], type: 'Veterinary Clinic', style: 'warm, friendly, trustworthy' },
  { keywords: ['pet', 'pet tech', 'dog', 'cat', 'animal'], type: 'Pet Tech', style: 'friendly, playful, warm' },
  // English — Lifestyle & Services
  { keywords: ['portfolio', 'personal', 'resume', 'cv'], type: 'personal portfolio', style: 'minimal, creative, clean' },
  { keywords: ['agency', 'studio', 'creative'], type: 'creative agency', style: 'bold, artistic, modern' },
  { keywords: ['photography', 'photo studio', 'photographer'], type: 'Photography Studio', style: 'visual, dark, elegant' },
  { keywords: ['marketing', 'seo', 'advertising', 'digital marketing'], type: 'Marketing Agency', style: 'bold, vibrant, modern' },
  { keywords: ['charity', 'nonprofit', 'foundation', 'cause'], type: 'nonprofit/charity', style: 'warm, trustworthy, community-focused' },
  { keywords: ['event', 'conference', 'wedding', 'festival'], type: 'event/conference', style: 'vibrant, exciting, organized' },
  { keywords: ['wedding', 'wedding planning', 'bride', 'groom'], type: 'Wedding/Event Planning', style: 'elegant, romantic, premium' },
  { keywords: ['hotel', 'hospitality', 'accommodation', 'lodging'], type: 'Hotel/Hospitality', style: 'elegant, inviting, premium' },
  { keywords: ['coworking', 'coworking space', 'shared office'], type: 'Coworking Space', style: 'modern, collaborative, clean' },
  { keywords: ['florist', 'flower', 'plant', 'garden'], type: 'Florist/Plant Shop', style: 'fresh, organic, green' },
  { keywords: ['brewery', 'winery', 'craft beer', 'wine'], type: 'Brewery/Winery', style: 'warm, artisanal, rich' },
  { keywords: ['church', 'religious', 'temple', 'mosque'], type: 'Church/Religious Organization', style: 'warm, dignified, welcoming' },
  { keywords: ['sports', 'sports team', 'club', 'league', 'athletic'], type: 'Sports Team/Club', style: 'energetic, bold, vibrant' },
  { keywords: ['museum', 'gallery', 'art', 'exhibition'], type: 'Museum/Gallery', style: 'elegant, minimal, refined' },
  // English — Education
  { keywords: ['course', 'e-learning', 'online course', 'mooc', 'udemy'], type: 'Online Course/E-learning', style: 'clean, approachable, engaging' },
  { keywords: ['language learning', 'language', 'duolingo', 'learn language'], type: 'Language Learning', style: 'playful, engaging, green' },
  { keywords: ['coding bootcamp', 'bootcamp', 'coding', 'learn code'], type: 'Coding Bootcamp', style: 'modern, tech, engaging' },
  // English — Transport & Logistics
  { keywords: ['logistics', 'shipping', 'freight', 'courier'], type: 'Logistics/Delivery', style: 'professional, efficient, trustworthy' },
  { keywords: ['automotive', 'car', 'dealership', 'vehicle', 'auto'], type: 'Automotive/Car Dealership', style: 'bold, professional, sleek' },
  { keywords: ['airline', 'aviation', 'flight', 'booking'], type: 'Airline', style: 'professional, trustworthy, sky blue' },
  { keywords: ['ride hailing', 'uber', 'taxi', 'transportation'], type: 'Ride Hailing / Transportation', style: 'clean, fast, trustworthy' },
  // English — Other
  { keywords: ['crypto', 'blockchain', 'web3', 'nft', 'defi'], type: 'crypto/web3', style: 'futuristic, bold, dark-mode-friendly' },
  { keywords: ['gaming', 'game', 'esports', 'game studio'], type: 'Gaming', style: 'neon, dark, energetic' },
  { keywords: ['government', 'public service', 'civic', 'municipal'], type: 'Government/Public', style: 'professional, high contrast, navy' },
  { keywords: ['home service', 'plumber', 'electrician', 'repair', 'cleaning'], type: 'Home Services (Plumber/Electrician)', style: 'trustworthy, professional, clean' },
  { keywords: ['childcare', 'daycare', 'kids', 'children', 'preschool'], type: 'Childcare/Daycare', style: 'warm, playful, friendly' },
  { keywords: ['senior care', 'elderly', 'nursing home', 'assisted living'], type: 'Senior Care/Elderly', style: 'warm, calm, trustworthy' },
  { keywords: ['agriculture', 'farm', 'agritech', 'farming'], type: 'Agriculture/Farm Tech', style: 'earthy, green, organic' },
  { keywords: ['recipe', 'cooking', 'cook', 'food recipe'], type: 'Recipe & Cooking', style: 'warm, appetizing, friendly' },
  { keywords: ['real estate', 'property', 'housing', 'apartment'], type: 'real estate', style: 'professional, trustworthy, premium' },
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

  // Detect business type — score-based (prefer longest/best match)
  let businessType: string | null = null;
  let inferredStyle: string | null = null;

  let bestScore = 0;
  for (const industry of INDUSTRY_MAP) {
    const score = industry.keywords.reduce(
      (acc, kw) => acc + (rawPrompt.toLowerCase().includes(kw.toLowerCase()) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      businessType = industry.type;
      inferredStyle = industry.style;
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
