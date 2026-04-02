/**
 * Template Registry — centralized registry for all section templates.
 *
 * Each template has:
 * - Unique ID (e.g., "hero_gradient_centered")
 * - Category (e.g., "hero") matching ComponentCategory
 * - Human-readable label + description (shown to AI for selection)
 * - Generator function that produces a SectionNode
 * - Default content for fallback when AI doesn't specify
 */

import type { SectionNode } from '@/types/dom-tree';

// ─── Content type interfaces ──────────────────────────────────────────────

export interface HeroContent {
  badge?: string;
  heading: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
  backgroundUrl?: string;
}

export interface FeaturesContent {
  heading?: string;
  subtitle?: string;
  items: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

export interface PricingContent {
  heading?: string;
  subtitle?: string;
  tiers: Array<{
    name: string;
    price: string;
    description?: string;
    period?: string;
    features: string[];
    ctaText?: string;
    highlighted?: boolean;
  }>;
}

export interface TestimonialContent {
  heading?: string;
  subtitle?: string;
  quotes: Array<{
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }>;
}

export interface CTAContent {
  badge?: string;
  heading: string;
  subtext?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaSecondaryText?: string;
}

export interface FAQContent {
  heading?: string;
  subtitle?: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ContactContent {
  heading?: string;
  subtitle?: string;
  fields?: string[];
  submitText?: string;
}

export interface GalleryContent {
  heading?: string;
  subtitle?: string;
  columns?: number;
  images: Array<{
    src: string;
    caption?: string;
  }>;
}

export interface TeamContent {
  heading?: string;
  subtitle?: string;
  members: Array<{
    name: string;
    role?: string;
    avatarUrl?: string;
  }>;
}

export interface StatsContent {
  heading?: string;
  subtitle?: string;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

export interface BlogContent {
  heading?: string;
  subtitle?: string;
  posts: Array<{
    title: string;
    excerpt?: string;
    imageUrl?: string;
    linkText?: string;
  }>;
}

export interface HeaderContent {
  siteName: string;
  links?: string[];
  ctaText?: string;
}

export interface FooterContent {
  siteName: string;
  copyright?: string;
  columns?: Array<{
    title: string;
    links: string[];
  }>;
}

export interface LogoGridContent {
  heading?: string;
  subtitle?: string;
  count?: number;
}

// ─── Template definition ──────────────────────────────────────────────────

export interface TemplateDefinition<T = Record<string, unknown>> {
  /** Unique template ID, e.g., "hero_gradient_centered" */
  id: string;
  /** Category matching ComponentCategory, e.g., "hero" */
  category: string;
  /** Human-readable label for AI selection */
  label: string;
  /** Description of layout/visual style for AI to understand */
  description: string;
  /** Generator function: takes content, returns SectionNode */
  generate: (content: T) => SectionNode;
  /** Default content for fallback/preview */
  defaultContent: T;
}

// ─── Registry ─────────────────────────────────────────────────────────────

const registry = new Map<string, TemplateDefinition>();
const categoryIndex = new Map<string, TemplateDefinition[]>();

/** Register a template into the global registry */
export function registerTemplate<T>(template: TemplateDefinition<T>): void {
  registry.set(template.id, template as TemplateDefinition);

  if (!categoryIndex.has(template.category)) {
    categoryIndex.set(template.category, []);
  }
  categoryIndex.get(template.category)!.push(template as TemplateDefinition);
}

/** Get a template by its unique ID */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return registry.get(id);
}

/** Get all templates in a category */
export function getTemplatesByCategory(category: string): TemplateDefinition[] {
  return categoryIndex.get(category) ?? [];
}

/** Get all registered templates */
export function getAllTemplates(): TemplateDefinition[] {
  return Array.from(registry.values());
}

/** Get template IDs grouped by category (for AI prompt) */
export function getTemplateCatalog(): Record<string, Array<{ id: string; label: string; description: string }>> {
  const catalog: Record<string, Array<{ id: string; label: string; description: string }>> = {};
  for (const [category, templates] of categoryIndex) {
    catalog[category] = templates.map((t) => ({
      id: t.id,
      label: t.label,
      description: t.description,
    }));
  }
  return catalog;
}

/** Get all template IDs */
export function getTemplateIds(): string[] {
  return Array.from(registry.keys());
}
