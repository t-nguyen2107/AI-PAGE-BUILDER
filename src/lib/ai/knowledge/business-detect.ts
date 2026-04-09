/**
 * Shared Business Type Detection — single source of truth.
 *
 * Used by StylePalettePicker, Winnie chat, generate-settings route,
 * and prompt-optimizer. All go through this one function instead of
 * maintaining separate keyword maps.
 */

import { PRODUCT_COLOR_PALETTES, resolveDesignGuidance } from './design-knowledge';

// ─── Keyword → canonical business type mapping ─────────────────────────
// Vietnamese + English keywords. The `type` field must match a key in PRODUCT_COLOR_PALETTES.
const KEYWORD_MAP: Array<{ keywords: string[]; type: string }> = [
  // Vietnamese
  { keywords: ['tiệm bánh', 'bánh ngọt', 'bánh kem'], type: 'bakery/pastry shop' },
  { keywords: ['nhà hàng', 'quán ăn', 'ẩm thực'], type: 'restaurant/dining' },
  { keywords: ['cà phê', 'quán cà phê'], type: 'coffee shop/cafe' },
  { keywords: ['spa', 'massage', 'thư giãn', 'wellness'], type: 'spa/wellness' },
  { keywords: ['fitness', 'gym', 'thể hình', 'thể thao', 'phòng gym'], type: 'fitness/gym' },
  { keywords: ['bất động sản', 'nhà đất'], type: 'real estate' },
  { keywords: ['giáo dục', 'trung tâm', 'khóa học'], type: 'education/training' },
  { keywords: ['y tế', 'phòng khám', 'bệnh viện'], type: 'healthcare/medical' },
  { keywords: ['thời trang', 'quần áo'], type: 'fashion/clothing' },
  { keywords: ['du lịch', 'khách sạn'], type: 'travel/hospitality' },
  { keywords: ['luật', 'pháp lý'], type: 'law firm/legal' },
  { keywords: ['xây dựng', 'kiến trúc'], type: 'construction/architecture' },
  // English — Food & Beverage
  { keywords: ['bakery', 'patisserie', 'pastry'], type: 'bakery/pastry shop' },
  { keywords: ['restaurant', 'dining', 'bistro', 'fine dining'], type: 'restaurant/dining' },
  { keywords: ['cafe', 'coffee shop', 'coffeehouse'], type: 'coffee shop/cafe' },
  { keywords: ['bar', 'pub', 'brewery', 'nightclub'], type: 'bar/pub' },
  { keywords: ['catering', 'meal prep', 'food delivery'], type: 'catering' },
  // English — Tech & SaaS
  { keywords: ['saas', 'software', 'startup', 'app platform'], type: 'SaaS/technology' },
  { keywords: ['micro saas', 'indie hacker', 'bootstrap'], type: 'Micro SaaS' },
  { keywords: ['b2b', 'enterprise'], type: 'B2B' },
  { keywords: ['ai', 'chatbot', 'artificial intelligence', 'machine learning', 'llm'], type: 'AI/Chatbot Platform' },
  { keywords: ['developer', 'dev tool', 'ide', 'programming'], type: 'Developer Tool / IDE' },
  { keywords: ['cybersecurity', 'security', 'vpn', 'privacy'], type: 'Cybersecurity Platform' },
  { keywords: ['analytics', 'dashboard', 'data visualization', 'bi'], type: 'Analytics' },
  { keywords: ['crm', 'client management', 'sales pipeline'], type: 'CRM & Client Management' },
  { keywords: ['productivity', 'task management', 'project management', 'collaboration'], type: 'Productivity' },
  { keywords: ['design system', 'component library', 'ui kit'], type: 'Design System/Component Library' },
  // English — Finance
  { keywords: ['fintech', 'banking', 'investment', 'trading'], type: 'Fintech/Crypto' },
  { keywords: ['insurance', 'coverage', 'policy'], type: 'Insurance Platform' },
  { keywords: ['personal finance', 'budget', 'expense'], type: 'Personal Finance Tracker' },
  // English — Services
  { keywords: ['agency', 'creative agency', 'digital agency', 'marketing agency'], type: 'agency/creative studio' },
  { keywords: ['consulting', 'consultancy', 'advisory'], type: 'consulting' },
  { keywords: ['law firm', 'legal', 'attorney', 'lawyer'], type: 'law firm/legal' },
  { keywords: ['accounting', 'bookkeeping', 'tax'], type: 'accounting' },
  { keywords: ['real estate', 'property', 'realtor'], type: 'real estate' },
  { keywords: ['construction', 'architecture', 'contractor'], type: 'construction/architecture' },
  // English — Health & Wellness
  { keywords: ['spa', 'massage', 'wellness center'], type: 'spa/wellness' },
  { keywords: ['healthcare', 'medical', 'clinic', 'hospital', 'dental'], type: 'healthcare/medical' },
  { keywords: ['fitness', 'gym', 'workout', 'yoga', 'crossfit', 'personal trainer'], type: 'fitness/gym' },
  { keywords: ['mental health', 'therapy', 'counseling'], type: 'mental health/counseling' },
  // English — Lifestyle
  { keywords: ['fashion', 'clothing', 'apparel', 'boutique'], type: 'fashion/clothing' },
  { keywords: ['jewelry', 'accessories'], type: 'jewelry/luxury' },
  { keywords: ['beauty', 'cosmetics', 'skincare', 'salon'], type: 'beauty/cosmetics' },
  { keywords: ['travel', 'tour', 'hotel', 'resort', 'hospitality'], type: 'travel/hospitality' },
  // English — Media & Content
  { keywords: ['blog', 'media', 'news', 'magazine', 'podcast'], type: 'blog/media' },
  { keywords: ['portfolio', 'photography', 'photo'], type: 'portfolio/photography' },
  { keywords: ['education', 'school', 'university', 'online course', 'e-learning'], type: 'education/training' },
  { keywords: ['nonprofit', 'charity', 'ngo', 'foundation'], type: 'nonprofit' },
  // English — Commerce
  { keywords: ['ecommerce', 'e-commerce', 'online store', 'shop', 'store', 'retail'], type: 'e-commerce' },
  { keywords: ['marketplace', 'platform'], type: 'marketplace' },
  { keywords: ['subscription', 'membership'], type: 'subscription service' },
  // English — Events
  { keywords: ['event', 'wedding', 'conference'], type: 'event planning' },
  { keywords: ['restaurant', 'food'], type: 'restaurant/dining' },
];

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Detect business type from freeform text (user prompt, idea description, etc.).
 * Returns the canonical key matching PRODUCT_COLOR_PALETTES, or null.
 *
 * Strategy:
 * 1. Keyword matching (Vietnamese + English)
 * 2. Direct PRODUCT_COLOR_PALETTES key match
 * 3. Word-level fuzzy match against palette keys
 */
export function detectBusinessType(text: string): string | null {
  const lower = text.toLowerCase();

  // Phase 1: Keyword matching (highest confidence)
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        return entry.type;
      }
    }
  }

  // Phase 2: Direct palette key match
  for (const key of Object.keys(PRODUCT_COLOR_PALETTES)) {
    const normKey = key.toLowerCase().replace(/[/\\]/g, ' ').trim();
    if (lower.includes(normKey)) {
      return key;
    }
  }

  // Phase 3: Word-level fuzzy match (reuse resolveDesignGuidance logic)
  const guidance = resolveDesignGuidance(text);
  if (guidance) {
    // resolveDesignGuidance found a match — extract which key it matched
    const words = lower.replace(/[/\\]/g, ' ').split(/\s+/).filter(w => w.length > 3);
    for (const key of Object.keys(PRODUCT_COLOR_PALETTES)) {
      const normKey = key.toLowerCase().replace(/[/\\]/g, ' ');
      const score = words.reduce((acc, w) => acc + (normKey.includes(w) ? 1 : 0), 0);
      if (score > 0) return key;
    }
  }

  return null;
}

/**
 * Get the list of all known business type keys from PRODUCT_COLOR_PALETTES.
 * Useful for UI dropdowns and validation.
 */
export function getKnownBusinessTypes(): string[] {
  return Object.keys(PRODUCT_COLOR_PALETTES);
}
