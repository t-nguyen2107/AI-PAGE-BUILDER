/**
 * Runtime Puck Data Normalization — fixes AI-generated data issues at load time.
 *
 * Fixes:
 *  1. Invalid component types (e.g. "ContentSection" → "TextBlock")
 *  2. Wrong prop names (e.g. "subheading" → "subtext")
 *  3. Wrong nested prop shapes (e.g. Gallery images[].url → .src)
 *
 * Applied in PuckEditor.tsx (editor) and preview page (public render).
 */

import type { Data } from '@puckeditor/core';
import { normalizeComponentType, VALID_COMPONENT_TYPES } from './prompts/component-catalog';

// ─── Per-type prop name fixes ────────────────────────────────────────────────

type PropFix = { from: string; to: string };

const PROP_FIXES: Record<string, PropFix[]> = {
  HeroSection: [
    { from: 'subheading', to: 'subtext' },
    { from: 'secondaryCtaText', to: 'ctaSecondaryText' },
    { from: 'secondaryCtaHref', to: 'ctaSecondaryHref' },
    { from: 'image', to: 'backgroundUrl' },
    { from: 'bgImage', to: 'backgroundUrl' },
    { from: 'backgroundImage', to: 'backgroundUrl' },
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  FeaturesGrid: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  FeatureShowcase: [
    { from: 'title', to: 'heading' },
    { from: 'subtitle', to: 'description' },
    { from: 'subheading', to: 'description' },
    { from: 'image', to: 'imageUrl' },
    { from: 'backgroundUrl', to: 'imageUrl' },
    { from: 'bgImage', to: 'imageUrl' },
    { from: 'backgroundImage', to: 'imageUrl' },
  ],
  CTASection: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
    { from: 'subheading', to: 'subtext' },
    { from: 'buttonText', to: 'ctaText' },
    { from: 'buttonHref', to: 'ctaHref' },
    { from: 'image', to: 'backgroundUrl' },
  ],
  StatsSection: [
    { from: 'subtitle', to: 'subtext' },
  ],
  TestimonialSection: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  FAQSection: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  ContactForm: [
    { from: 'subheading', to: 'subtext' },
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
    { from: 'ctaText', to: 'buttonText' },
    { from: 'buttonLabel', to: 'buttonText' },
  ],
  PricingTable: [
    { from: 'subheading', to: 'subtext' },
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  BlogSection: [
    { from: 'subtitle', to: 'subtext' },
  ],
  TeamSection: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  NewsletterSignup: [
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
    { from: 'subheading', to: 'subtext' },
  ],
  Gallery: [
    { from: 'subheading', to: 'subtext' },
    { from: 'subtitle', to: 'subtext' },
    { from: 'description', to: 'subtext' },
  ],
  TextBlock: [
    { from: 'text', to: 'content' },
    { from: 'body', to: 'content' },
  ],
  FooterSection: [
    { from: 'subheading', to: 'subtext' },
    { from: 'subtitle', to: 'subtext' },
  ],
};

// ─── Nested prop fixes ──────────────────────────────────────────────────────

/** Fix Gallery images: { url, caption } → { src, alt } */
function fixGalleryImages(props: Record<string, unknown>): void {
  const images = props.images;
  if (!Array.isArray(images)) return;

  props.images = images.map((img: Record<string, unknown>) => {
    if (!img || typeof img !== 'object') return img;
    const fixed = { ...img };
    if (!fixed.src && fixed.url) {
      fixed.src = fixed.url;
      delete fixed.url;
    }
    if (!fixed.alt && fixed.caption) {
      fixed.alt = fixed.caption;
    }
    return fixed;
  });
}

/** Fix PricingTable plans: highlight → highlighted */
function fixPricingPlans(props: Record<string, unknown>): void {
  const plans = props.plans;
  if (!Array.isArray(plans)) return;

  props.plans = plans.map((plan: Record<string, unknown>) => {
    if (!plan || typeof plan !== 'object') return plan;
    const fixed = { ...plan };
    if ('highlight' in fixed && !('highlighted' in fixed)) {
      fixed.highlighted = !!fixed.highlight;
      delete fixed.highlight;
    }
    // Ensure features are { value } objects or strings
    if (Array.isArray(fixed.features)) {
      fixed.features = fixed.features.map((f: unknown) => {
        if (typeof f === 'string') return { value: f };
        if (f && typeof f === 'object' && !('value' in (f as Record<string, unknown>))) {
          return { value: String((f as Record<string, unknown>).description ?? (f as Record<string, unknown>).text ?? f) };
        }
        return f;
      });
    }
    return fixed;
  });
}

/** Fix FooterSection: flat links[] → linkGroups[] */
function fixFooterLinks(props: Record<string, unknown>): void {
  // If already has linkGroups, leave alone
  if (Array.isArray(props.linkGroups) && props.linkGroups.length > 0) return;

  // Convert flat links + socialLinks to linkGroups format
  const links = props.links;
  if (Array.isArray(links) && links.length > 0) {
    props.linkGroups = [{ title: 'Quick Links', links }];
    delete props.links;
  }
  // socialLinks is not a standard prop — just remove it silently
  if ('socialLinks' in props) {
    delete props.socialLinks;
  }
}

/** Fix FeatureShowcase image */
function fixFeatureShowcaseImage(props: Record<string, unknown>): void {
  // imageUrl is required — ensure it exists
  if (!props.imageUrl && (props.image || props.backgroundUrl)) {
    props.imageUrl = props.image || props.backgroundUrl;
  }
}

/** Fix BlogSection posts: ensure each post has required fields */
function fixBlogPosts(props: Record<string, unknown>): void {
  const posts = props.posts;
  if (!Array.isArray(posts)) return;

  props.posts = posts.map((post: Record<string, unknown>, i: number) => {
    if (!post || typeof post !== 'object') return post;
    const fixed = { ...post };
    if (!fixed.imageUrl && (fixed.image || fixed.thumbnail)) {
      fixed.imageUrl = fixed.image || fixed.thumbnail;
    }
    if (!fixed.href) {
      fixed.href = `#post-${i + 1}`;
    }
    return fixed;
  });
}

/** Fix TeamSection members: ensure each has name + role */
function fixTeamMembers(props: Record<string, unknown>): void {
  const members = props.members;
  if (!Array.isArray(members)) return;

  props.members = members.map((m: Record<string, unknown>) => {
    if (!m || typeof m !== 'object') return m;
    const fixed = { ...m };
    if (!fixed.avatarUrl && fixed.avatar) {
      fixed.avatarUrl = fixed.avatar;
    }
    return fixed;
  });
}

/** Fix TestimonialSection: ensure quote/author structure */
function fixTestimonials(props: Record<string, unknown>): void {
  const testimonials = props.testimonials;
  if (!Array.isArray(testimonials)) return;

  props.testimonials = testimonials.map((t: Record<string, unknown>) => {
    if (!t || typeof t !== 'object') return t;
    const fixed = { ...t };
    if (!fixed.quote && (t.text || t.content)) {
      fixed.quote = t.text || t.content;
    }
    if (!fixed.author && t.name) {
      fixed.author = t.name;
    }
    if (!fixed.role && t.title) {
      fixed.role = t.title;
    }
    return fixed;
  });
}

// ─── Main normalization ──────────────────────────────────────────────────────

/** Map of type-specific nested fixers */
const NESTED_FIXERS: Record<string, (props: Record<string, unknown>) => void> = {
  Gallery: fixGalleryImages,
  PricingTable: fixPricingPlans,
  FooterSection: fixFooterLinks,
  BlogSection: fixBlogPosts,
  TeamSection: fixTeamMembers,
  TestimonialSection: fixTestimonials,
  FeatureShowcase: fixFeatureShowcaseImage,
};

/**
 * Normalize a single Puck component's type and props.
 * Returns a new object — does not mutate input.
 */
export function normalizeComponent(comp: { type: string; props: Record<string, unknown> }): {
  type: string;
  props: Record<string, unknown>;
} {
  // 1. Fix component type
  let normalizedType = normalizeComponentType(comp.type);
  if (!VALID_COMPONENT_TYPES.has(normalizedType)) {
    // If still invalid after normalization, try harder
    // Common pattern: "XxxSection" where the base name is valid
    const lower = comp.type.toLowerCase();
    if (lower.includes('content') || lower.includes('text') || lower.includes('richtext')) {
      normalizedType = 'TextBlock';
    } else {
      console.warn(`[normalize-puck-data] Unknown component type "${comp.type}" → keeping as-is`);
      normalizedType = comp.type;
    }
  }

  // 2. Fix prop names
  const props = { ...comp.props } as Record<string, unknown>;
  const fixes = PROP_FIXES[normalizedType] ?? [];
  for (const { from, to } of fixes) {
    if (from in props && !(to in props)) {
      props[to] = props[from];
      delete props[from];
    }
  }

  // 3. Remove non-standard meta props
  delete props.sectionType;

  // 4. Run type-specific nested fixers
  const fixer = NESTED_FIXERS[normalizedType];
  if (fixer) {
    fixer(props);
  }

  return { type: normalizedType, props };
}

/**
 * Normalize an entire Puck Data object.
 * Fixes component types, prop names, and nested structures.
 * Returns a new object — does not mutate input.
 */
export function normalizePuckData(data: Data): Data {
  if (!data || !data.content) return data;

  return {
    root: data.root,
    content: data.content.map((comp) => {
      const props = comp.props as Record<string, unknown>;
      return normalizeComponent({ type: comp.type, props });
    }),
  };
}
