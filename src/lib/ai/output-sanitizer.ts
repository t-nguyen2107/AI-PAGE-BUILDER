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
    layout: 'centered',
    backgroundOverlay: false,
    animation: 'none',
    padding: '96px',
  },
  FeaturesGrid: {
    heading: 'Our Features',
    columns: 3,
    variant: 'grid',
    cardStyle: 'icon',
    animation: 'none',
    hoverEffect: 'none',
    features: [
      { title: 'Feature 1', description: 'Description for feature 1.', icon: 'zap' },
      { title: 'Feature 2', description: 'Description for feature 2.', icon: 'speed' },
      { title: 'Feature 3', description: 'Description for feature 3.', icon: 'shield' },
    ],
  },
  PricingTable: {
    heading: 'Pricing Plans',
    pricingToggle: false,
    highlightedBadge: 'Popular',
    currency: '$',
    animation: 'none',
    plans: [
      { name: 'Free', price: '$0', period: '/month', description: '', features: [{ value: 'Basic' }], ctaText: 'Start', ctaHref: '#', highlighted: false },
    ],
  },
  TestimonialSection: {
    heading: 'Testimonials',
    variant: 'grid',
    autoplay: false,
    interval: 5000,
    animation: 'none',
    testimonials: [{ quote: 'Great product!', author: 'User', role: '' }],
  },
  CTASection: {
    heading: 'Ready to Get Started?',
    ctaText: 'Get Started',
    ctaHref: '#',
    layout: 'centered',
    imagePosition: 'right',
    variant: 'default',
  },
  FAQSection: {
    heading: 'FAQ',
    accordion: true,
    columns: 1,
    searchable: false,
    items: [{ question: 'Question?', answer: 'Answer.' }],
  },
  StatsSection: {
    heading: 'Stats',
    stats: [{ value: '100+', label: 'Users' }],
    columns: 4,
    animated: false,
    duration: 2000,
    animation: 'none',
  },
  TeamSection: {
    heading: 'Our Team',
    hoverEffect: 'none',
    socialLinks: false,
    animation: 'none',
    members: [{ name: 'Team Member', role: 'Role' }],
  },
  BlogSection: {
    heading: 'Latest Posts',
    posts: [{ title: 'Blog Post', excerpt: 'Excerpt', date: '2025-01-01', href: '#', category: '' }],
    columns: 3,
    variant: 'grid',
    masonry: false,
    categoryFilter: false,
    animation: 'none',
  },
  LogoGrid: {
    heading: 'Trusted By',
    logos: [{ name: 'Brand', imageUrl: '/logos/placeholder.svg' }],
    variant: 'grid',
    grayscale: true,
    tooltip: false,
    animation: 'none',
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
    mobileMenu: true,
    transparent: false,
    showSearch: false,
  },
  FooterSection: {
    logo: 'YourBrand',
    linkGroups: [{ title: 'Links', links: [{ label: 'Home', href: '#' }] }],
    copyright: `\u00a9 ${new Date().getFullYear()} YourBrand.`,
    socialLinks: [],
    backToTop: false,
    newsletterIntegration: false,
    showCopyright: true,
  },
  TextBlock: {
    content: '<p>Enter text here...</p>',
    align: 'left',
    maxWidth: 'lg',
  },
  ImageBlock: {
    src: 'https://picsum.photos/seed/hero-gradient-purple/1200/800',
    alt: 'Image',
    width: '100%',
    borderRadius: 'md',
  },
  Spacer: { height: 32, showDivider: false, dividerStyle: 'solid', dividerWidth: 'full' },
  ColumnsLayout: { columns: 2, gap: 24, unequalWidths: false, stackOrder: 'normal' },
  // ─── New section components ─────────────────────────────────────
  NewsletterSignup: {
    heading: 'Stay Updated',
    subtext: 'Subscribe to our newsletter.',
    buttonText: 'Subscribe',
    placeholder: 'Enter your email',
    layout: 'centered',
    bgVariant: 'none',
    animation: 'none',
  },
  Gallery: {
    heading: 'Gallery',
    images: [{ src: 'https://picsum.photos/seed/hero-gradient-purple/1200/800', alt: 'Image' }],
    columns: 3,
    variant: 'grid',
    lightbox: false,
    hoverEffect: 'none',
  },
  SocialProof: {
    heading: 'Trusted by Thousands',
    variant: 'default',
    stats: [{ value: '10K+', label: 'Users' }],
    logos: [],
    showAvatars: true,
    avatarCount: 5,
    animated: false,
    animation: 'none',
  },
  ComparisonTable: {
    heading: 'Compare Plans',
    tooltipDetails: false,
    animation: 'none',
    plans: [{ name: 'Basic', highlighted: false, features: [{ value: 'Yes' }] }],
  },
  ProductCards: {
    heading: 'Our Products',
    quickView: false,
    saleBadge: false,
    hoverEffect: 'none',
    products: [{ name: 'Product', price: '$29', imageUrl: 'https://picsum.photos/seed/hero-gradient-purple/1200/800', href: '#', inStock: true }],
    columns: 3,
  },
  FeatureShowcase: {
    heading: 'Why Choose Us',
    description: 'Discover what makes us different.',
    imageUrl: 'https://picsum.photos/seed/hero-gradient-purple/1200/800',
    features: [{ title: 'Feature', description: 'Description', icon: 'zap' }],
    imagePosition: 'right',
    animation: 'none',
    tabbed: false,
  },
  CountdownTimer: {
    heading: 'Limited Time Offer',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showDays: true,
    showHours: true,
    style: 'default',
    showLabels: true,
    animation: 'none',
    endMessage: 'This offer has ended!',
  },
  AnnouncementBar: {
    message: 'Special offer! Get 20% off today.',
    ctaText: 'Learn More',
    ctaHref: '#',
    bgColor: 'primary',
    dismissible: false,
    animation: 'none',
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
  CustomSection: {
    html: '<div class="p-8 text-center text-muted-foreground"><p>Custom section — edit HTML in sidebar</p></div>',
    css: '',
    preview: 'Custom section',
    minHeight: '200px',
  },
};

// ─── Emoji stripping ─────────────────────────────────────────────────────────

import { stripEmojis } from './utils';

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
