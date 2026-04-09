import { AIAction, ComponentCategory } from '@/types/enums';
import type { ParsedIntent } from '@/types/ai';

/** Keywords that map to AI actions. */
const ACTION_KEYWORDS: Record<string, AIAction[]> = {
  add: [AIAction.INSERT_SECTION],
  insert: [AIAction.INSERT_SECTION, AIAction.INSERT_COMPONENT],
  create: [AIAction.INSERT_SECTION],
  generate: [AIAction.INSERT_SECTION],
  build: [AIAction.INSERT_SECTION],
  place: [AIAction.INSERT_SECTION],
  put: [AIAction.INSERT_SECTION],
  modify: [AIAction.MODIFY_NODE],
  change: [AIAction.MODIFY_NODE],
  update: [AIAction.MODIFY_NODE],
  edit: [AIAction.MODIFY_NODE],
  style: [AIAction.MODIFY_NODE],
  improve: [AIAction.MODIFY_NODE],
  enhance: [AIAction.MODIFY_NODE],
  better: [AIAction.MODIFY_NODE],
  fix: [AIAction.MODIFY_NODE],
  'đẹp hơn': [AIAction.MODIFY_NODE],
  'tối ưu': [AIAction.MODIFY_NODE],

  delete: [AIAction.DELETE_NODE],
  remove: [AIAction.DELETE_NODE],
  replace: [AIAction.REPLACE_NODE],
  swap: [AIAction.REPLACE_NODE],
  move: [AIAction.REORDER_CHILDREN],
  reorder: [AIAction.REORDER_CHILDREN],
  rearrange: [AIAction.REORDER_CHILDREN],
  generate_page: [AIAction.FULL_PAGE],
  full_page: [AIAction.FULL_PAGE],
};

/** Keywords that map to component categories. */
const CATEGORY_KEYWORDS: Record<string, ComponentCategory> = {
  hero: ComponentCategory.HERO,
  banner: ComponentCategory.HERO,
  landing: ComponentCategory.HERO,
  pricing: ComponentCategory.PRICING,
  plan: ComponentCategory.PRICING,
  plans: ComponentCategory.PRICING,
  tier: ComponentCategory.PRICING,
  tiers: ComponentCategory.PRICING,
  feature: ComponentCategory.FEATURES,
  features: ComponentCategory.FEATURES,
  grid: ComponentCategory.FEATURES,
  testimonial: ComponentCategory.TESTIMONIAL,
  testimonials: ComponentCategory.TESTIMONIAL,
  review: ComponentCategory.TESTIMONIAL,
  reviews: ComponentCategory.TESTIMONIAL,
  quote: ComponentCategory.TESTIMONIAL,
  cta: ComponentCategory.CTA,
  'call to action': ComponentCategory.CTA,
  'call-to-action': ComponentCategory.CTA,
  faq: ComponentCategory.FAQ,
  accordion: ComponentCategory.FAQ,
  gallery: ComponentCategory.GALLERY,
  image: ComponentCategory.GALLERY,
  images: ComponentCategory.GALLERY,
  portfolio: ComponentCategory.GALLERY,
  contact: ComponentCategory.CONTACT,
  form: ComponentCategory.CONTACT,
  'contact form': ComponentCategory.CONTACT,
  header: ComponentCategory.HEADER_NAV,
  nav: ComponentCategory.HEADER_NAV,
  navigation: ComponentCategory.HEADER_NAV,
  navbar: ComponentCategory.HEADER_NAV,
  menu: ComponentCategory.HEADER_NAV,
  footer: ComponentCategory.FOOTER,
  stats: ComponentCategory.STATS,
  statistic: ComponentCategory.STATS,
  statistics: ComponentCategory.STATS,
  counter: ComponentCategory.STATS,
  numbers: ComponentCategory.STATS,
  team: ComponentCategory.TEAM,
  'team member': ComponentCategory.TEAM,
  'team members': ComponentCategory.TEAM,
  staff: ComponentCategory.TEAM,
  people: ComponentCategory.TEAM,
  logo: ComponentCategory.LOGO_GRID,
  logos: ComponentCategory.LOGO_GRID,
  'logo grid': ComponentCategory.LOGO_GRID,
  partners: ComponentCategory.LOGO_GRID,
  clients: ComponentCategory.LOGO_GRID,
  blog: ComponentCategory.BLOG,
  post: ComponentCategory.BLOG,
  posts: ComponentCategory.BLOG,
  article: ComponentCategory.BLOG,
  articles: ComponentCategory.BLOG,
  news: ComponentCategory.BLOG,
};

/**
 * Extracts a numeric count from a prompt string.
 * Looks for patterns like "3 items", "with 4", "three", etc.
 */
function extractCount(prompt: string): number | undefined {
  // Match numeric patterns: "3 tiers", "5 items", "with 4"
  const numericMatch = prompt.match(/\b(\d+)\s*(?:items?|tiers?|cards?|columns?|rows?|sections?|elements?|components?|links?|blocks?|entries?|people?|quotes?)\b/i);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }

  // Match standalone number after "with": "with 3"
  const withMatch = prompt.match(/\bwith\s+(\d+)\b/i);
  if (withMatch) {
    return parseInt(withMatch[1], 10);
  }

  // Word numbers
  const wordNumbers: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  const lower = prompt.toLowerCase();
  for (const [word, num] of Object.entries(wordNumbers)) {
    if (lower.includes(word)) {
      return num;
    }
  }

  return undefined;
}

/**
 * Extracts color-related properties from the prompt.
 */
function extractColors(prompt: string): Record<string, string> | undefined {
  const colorPatterns = [
    /(?:color|colour)\s+(?:is\s+)?['"]?(#[0-9a-fA-F]{3,8}|[\w]+)['"]?/i,
    /(?:background|bg)\s+(?:color\s+)?['"]?(#[0-9a-fA-F]{3,8}|[\w]+)['"]?/i,
  ];
  const props: Record<string, string> = {};

  for (const pattern of colorPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      props.color = match[1];
    }
  }

  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Extracts text content from quoted strings in the prompt.
 */
function extractTextContent(prompt: string): Record<string, string> | undefined {
  const props: Record<string, string> = {};
  const quotedMatch = prompt.match(/"([^"]+)"/);
  if (quotedMatch) {
    props.text = quotedMatch[1];
  }
  const singleQuoted = prompt.match(/'([^']+)'/);
  if (singleQuoted && !props.text) {
    props.text = singleQuoted[1];
  }
  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Parses a natural language prompt into a structured intent.
 *
 * Determines the action, target component category, properties, and count
 * using keyword matching against the prompt text.
 *
 * Example: "Add a pricing section with 3 tiers"
 *   -> { action: 'insert_section', componentCategory: 'pricing', properties: { tiers: 3 }, count: 3 }
 */
export function parsePrompt(prompt: string): ParsedIntent {
  const normalized = prompt.toLowerCase().trim();

  // Determine action
  let action = AIAction.INSERT_SECTION; // default
  for (const [keyword, actions] of Object.entries(ACTION_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      action = actions[0];
      break;
    }
  }

  // Determine component category
  let componentCategory: string | undefined;
  // Try multi-word categories first (longer matches take precedence)
  const sortedCategories = Object.entries(CATEGORY_KEYWORDS).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [keyword, category] of sortedCategories) {
    if (normalized.includes(keyword)) {
      componentCategory = category;
      break;
    }
  }

  // Determine count
  const count = extractCount(prompt);

  // Determine properties
  const properties: Record<string, unknown> = {};
  const colors = extractColors(prompt);
  if (colors) {
    Object.assign(properties, colors);
  }
  const textContent = extractTextContent(prompt);
  if (textContent) {
    Object.assign(properties, textContent);
  }
  if (count !== undefined) {
    if (componentCategory === ComponentCategory.PRICING) {
      properties.tiers = count;
    } else if (componentCategory === ComponentCategory.FEATURES) {
      properties.columns = count;
      properties.items = count;
    } else if (componentCategory === ComponentCategory.TESTIMONIAL) {
      properties.quotes = count;
    } else if (componentCategory === ComponentCategory.GALLERY) {
      properties.images = count;
    } else if (componentCategory === ComponentCategory.FAQ) {
      properties.items = count;
    } else if (componentCategory === ComponentCategory.STATS) {
      properties.count = count;
    } else if (componentCategory === ComponentCategory.TEAM) {
      properties.count = count;
    } else if (componentCategory === ComponentCategory.LOGO_GRID) {
      properties.count = count;
    } else if (componentCategory === ComponentCategory.BLOG) {
      properties.count = count;
    } else {
      properties.count = count;
    }
  }

  const targetDescription = prompt.trim();

  return {
    action,
    componentCategory,
    properties: Object.keys(properties).length > 0 ? properties : undefined,
    targetDescription,
    count,
  };
}
