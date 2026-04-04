/**
 * Output Sanitizer — cleans up AI-generated Puck component data.
 *
 * Fixes common LLM issues:
 * 1. Missing or duplicate component IDs
 * 2. Emojis in text content
 * 3. Invalid prop values (wrong types, out-of-range)
 * 4. Missing required props (filled with defaults)
 */

import type { ComponentData } from '@puckeditor/core';
import { autoNameComponent } from '@/puck/lib/auto-name';

// ─── Default props per component type ────────────────────────────────────────

const DEFAULTS: Record<string, Record<string, unknown>> = {
  HeroSection: {
    heading: 'Welcome to Our Website',
    subtext: 'Build something amazing with our platform.',
    ctaText: 'Get Started',
    ctaHref: '#',
    align: 'center',
    backgroundOverlay: false,
    padding: '96px',
  },
  FeaturesGrid: {
    heading: 'Our Features',
    columns: 3,
    features: [
      { title: 'Feature 1', description: 'Description for feature 1.', icon: 'zap' },
      { title: 'Feature 2', description: 'Description for feature 2.', icon: 'speed' },
      { title: 'Feature 3', description: 'Description for feature 3.', icon: 'shield' },
    ],
  },
  PricingTable: {
    heading: 'Pricing Plans',
    plans: [
      { name: 'Free', price: '$0', period: '/month', description: '', features: [{ value: 'Basic' }], ctaText: 'Start', ctaHref: '#', highlighted: false },
    ],
  },
  TestimonialSection: {
    heading: 'Testimonials',
    testimonials: [{ quote: 'Great product!', author: 'User', role: '' }],
  },
  CTASection: {
    heading: 'Ready to Get Started?',
    ctaText: 'Get Started',
    ctaHref: '#',
  },
  FAQSection: {
    heading: 'FAQ',
    items: [{ question: 'Question?', answer: 'Answer.' }],
  },
  StatsSection: {
    heading: 'Stats',
    stats: [{ value: '100+', label: 'Users' }],
    columns: 4,
  },
  TeamSection: {
    heading: 'Our Team',
    members: [{ name: 'Team Member', role: 'Role' }],
  },
  BlogSection: {
    heading: 'Latest Posts',
    posts: [{ title: 'Blog Post', excerpt: 'Excerpt', date: '2025-01-01', href: '#' }],
    columns: 3,
  },
  LogoGrid: {
    heading: 'Trusted By',
    logos: [{ name: 'Brand', imageUrl: '/logos/placeholder.svg' }],
  },
  ContactForm: {
    heading: 'Contact Us',
    showPhone: false,
    showCompany: false,
    buttonText: 'Send Message',
  },
  HeaderNav: {
    logo: 'YourBrand',
    links: [{ label: 'Home', href: '#' }],
    sticky: true,
  },
  FooterSection: {
    logo: 'YourBrand',
    linkGroups: [{ title: 'Links', links: [{ label: 'Home', href: '#' }] }],
    copyright: `\u00a9 ${new Date().getFullYear()} YourBrand.`,
  },
  TextBlock: {
    content: '<p>Enter text here...</p>',
    align: 'left',
    maxWidth: 'lg',
  },
  ImageBlock: {
    src: '/stock/hero/gradient-purple.webp',
    alt: 'Image',
    width: '100%',
    borderRadius: 'md',
  },
  Spacer: { height: 32 },
  ColumnsLayout: { columns: 2, gap: 24 },
  // ─── New section components ─────────────────────────────────────
  NewsletterSignup: {
    heading: 'Stay Updated',
    subtext: 'Subscribe to our newsletter.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email',
  },
  Gallery: {
    heading: 'Gallery',
    images: [{ src: '/stock/hero/gradient-purple.webp', alt: 'Image' }],
    columns: 3,
  },
  SocialProof: {
    heading: 'Trusted by Thousands',
    stats: [{ value: '10K+', label: 'Users' }],
  },
  ComparisonTable: {
    heading: 'Compare Plans',
    plans: [{ name: 'Basic', features: [{ value: 'Yes' }] }],
  },
  ProductCards: {
    heading: 'Our Products',
    products: [{ title: 'Product', price: '$29', imageUrl: '/stock/hero/gradient-purple.webp', href: '#' }],
    columns: 3,
  },
  FeatureShowcase: {
    heading: 'Why Choose Us',
    description: 'Discover what makes us different.',
    imageUrl: '/stock/hero/gradient-purple.webp',
    features: [{ title: 'Feature', description: 'Description' }],
  },
  CountdownTimer: {
    heading: 'Limited Time Offer',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  AnnouncementBar: {
    message: 'Special offer! Get 20% off today.',
    ctaText: 'Learn More',
    ctaHref: '#',
    variant: 'primary',
  },
  Banner: {
    heading: 'Important Update',
    subtext: 'Check out our latest features.',
    ctaText: 'Learn More',
    ctaHref: '#',
    variant: 'info',
  },
  HeadingBlock: { text: 'Heading', level: 'h2', align: 'left', size: 'md' },
  ButtonBlock: { label: 'Click me', href: '#', variant: 'primary', size: 'md', fullWidth: false },
  CardBlock: { title: 'Card Title', description: 'Card description' },
  SectionBlock: { paddingY: '64px', paddingX: '24px', maxWidth: '1280px', bgColor: '', bgImageUrl: '', bgOverlay: false },
  Blank: {},
  Flex: { direction: 'row', justifyContent: 'start', alignItems: 'start', gap: 16, wrap: false },
  Grid: { numColumns: 3, gap: 24, items: [] as unknown },
};

// ─── Emoji stripping ─────────────────────────────────────────────────────────

const EMOJI_RE = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

function stripEmojis(text: string): string {
  return text.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
}

// ─── ID deduplication ────────────────────────────────────────────────────────

function ensureUniqueId(props: Record<string, unknown>, usedIds: Set<string>, index: number): string {
  let id = props.id as string;
  if (!id || typeof id !== 'string') {
    id = `comp_${Date.now()}_${index}`;
  }
  if (usedIds.has(id)) {
    id = `${id}_${index}`;
  }
  usedIds.add(id);
  return id;
}

// ─── Per-component sanitization ──────────────────────────────────────────────

function sanitizeComponent(comp: Record<string, unknown>, index: number, usedIds: Set<string>): ComponentData {
  const type = typeof comp.type === 'string' ? comp.type : 'TextBlock';
  const props = { ...(comp.props as Record<string, unknown> ?? {}) };

  // Ensure unique ID
  props.id = ensureUniqueId(props, usedIds, index);

  // Strip emojis from text fields
  for (const key of ['heading', 'subtext', 'message', 'content', 'question', 'answer', 'quote', 'excerpt', 'name', 'label', 'description']) {
    if (typeof props[key] === 'string') {
      props[key] = stripEmojis(props[key] as string);
    }
  }

  // Fill missing required props with defaults
  const defaults = DEFAULTS[type];
  if (defaults) {
    for (const [key, value] of Object.entries(defaults)) {
      if (props[key] === undefined || props[key] === null || props[key] === '') {
        props[key] = typeof value === 'object' ? structuredClone(value) : value;
      }
    }
  }

  // Type-specific fixes
  if (type === 'Spacer' && typeof props.height === 'string') {
    props.height = parseInt(props.height as string, 10) || 32;
  }
  if (type === 'ColumnsLayout' && typeof props.columns === 'string') {
    props.columns = parseInt(props.columns as string, 10) || 2;
  }
  if (type === 'ColumnsLayout' && typeof props.gap === 'string') {
    props.gap = parseInt(props.gap as string, 10) || 24;
  }
  if ((type === 'FeaturesGrid' || type === 'StatsSection') && typeof props.columns === 'string') {
    props.columns = parseInt(props.columns as string, 10) || 3;
  }
  if (type === 'BlogSection' && typeof props.columns === 'string') {
    props.columns = parseInt(props.columns as string, 10) || 3;
  }

  // Auto-generate human-readable name if missing
  if (!props.name || typeof props.name !== 'string' || props.name.trim() === '') {
    props.name = autoNameComponent(type, props, index);
  }

  return { type, props } as ComponentData;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sanitize the full AI response.
 * Call AFTER JSON parsing, BEFORE validation.
 */
export function sanitizeAIResponse(raw: Record<string, unknown>): Record<string, unknown> {
  // Strip emojis from message
  if (typeof raw.message === 'string') {
    raw.message = stripEmojis(raw.message);
  }

  // Handle "components" field (new Puck format)
  if (Array.isArray(raw.components)) {
    const usedIds = new Set<string>();
    raw.components = (raw.components as Record<string, unknown>[]).map((comp, i) => {
      if (!comp || typeof comp !== 'object') return comp;
      return sanitizeComponent({ ...comp }, i, usedIds);
    });
  }

  // Handle legacy "nodes" field — convert to components
  if (!raw.components && Array.isArray(raw.nodes)) {
    // Mark for conversion by the adapter layer
    raw._legacyNodes = true;
  }

  return raw;
}
