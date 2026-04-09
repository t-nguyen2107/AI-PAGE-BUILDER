/**
 * Post-Processing Defaults Engine
 *
 * Guarantees visual polish props (animations, gradients, hover effects, variants,
 * backgrounds, images) on every component — even when the AI forgets them.
 *
 * Runs after AI output, before emit. Zero LLM cost.
 */

import type { ComponentData } from '@puckeditor/core';
import type { DesignGuidance, ColorPalette } from './knowledge/design-knowledge';
import { mapStylePriorityToDesignStyle } from './prompts/prompt-utils';
import { picsumUrl } from '../../features/ai/stock-images';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DefaultsContext {
  businessType?: string;
  businessName?: string;
  designGuidance?: DesignGuidance;
  /** Raw styleguide colors (JSON string or object) as fallback for gradient injection */
  styleguideColors?: { primary?: string; secondary?: string; accent?: string } | string;
}

type Props = Record<string, unknown>;

// ─── Per-Component Default Props ──────────────────────────────────────────────
// These are merged only when the AI did NOT set the prop.

const COMPONENT_DEFAULTS: Record<string, Props> = {
  HeroSection: {
    animation: 'fade-up',
    backgroundOverlay: true,
    padding: '128px',
    align: 'center',
    layout: 'centered',
  },
  FeaturesGrid: {
    animation: 'stagger',
    cardStyle: 'elevated',
    hoverEffect: 'lift',
    columns: 3,
  },
  TestimonialSection: {
    animation: 'stagger-fade',
    variant: 'grid',
  },
  CTASection: {
    animation: 'fade-up',
    variant: 'gradient',
  },
  PricingTable: {
    animation: 'stagger',
    highlightedBadge: 'Most Popular',
  },
  FAQSection: {
    animation: 'fade-up',
  },
  StatsSection: {
    animation: 'fade-up',
    animated: true,
    columns: 4,
    cardStyle: 'gradient',
  },
  ContactForm: {
    animation: 'fade-up',
    showPhone: true,
    showCompany: true,
  },
  Gallery: {
    animation: 'stagger',
    columns: 3,
  },
  ProductCards: {
    animation: 'stagger',
    hoverEffect: 'lift',
    columns: 3,
  },
  TeamSection: {
    animation: 'stagger',
  },
  BlogSection: {
    animation: 'stagger',
    columns: 3,
  },
  FeatureShowcase: {
    animation: 'fade-up',
  },
  LogoGrid: {
    animation: 'fade-up',
  },
  NewsletterSignup: {
    animation: 'fade-up',
  },
  SocialProof: {
    animation: 'fade-up',
  },
  Banner: {
    animation: 'fade-up',
    variant: 'gradient',
  },
  ComparisonTable: {
    animation: 'fade-up',
  },
  CountdownTimer: {
    animation: 'fade-up',
  },
  AnnouncementBar: {
    variant: 'gradient',
    animation: 'fade-down',
  },
  // Structural components
  HeaderNav: { sticky: true, animation: 'fade-down' },
  FooterSection: { animation: 'fade-up' },
  Spacer: {},
  TextBlock: {},
  ImageBlock: {},
  HeadingBlock: {},
  RichTextBlock: {},
  ButtonBlock: {},
  CardBlock: {},
  SectionBlock: {},
  Blank: {},
  Flex: {},
  Grid: {},
  ColumnsLayout: {},
  CustomSection: {},
};

// ─── Business Type → Hero Background Image Mapping ────────────────────────────

const HERO_BACKGROUNDS: Record<string, string> = {
  'SaaS/technology':           picsumUrl('hero-tech-dark', 1200, 800),
  'e-commerce/store':          picsumUrl('fashion-shopping', 1200, 800),
  'e-commerce/luxury':         picsumUrl('fashion-luxury', 1200, 800),
  'restaurant/dining':         picsumUrl('food-meal-table', 1200, 800),
  'bakery/pastry shop':        picsumUrl('food-pancakes', 1200, 800),
  'coffee shop/cafe':          picsumUrl('drink-coffee-shop', 1200, 800),
  'spa/wellness':              picsumUrl('lifestyle-spa', 1200, 800),
  'fitness/gym':               picsumUrl('fitness-gym', 1200, 800),
  'real estate':               picsumUrl('realestate-luxury-home', 1200, 800),
  'education/training':        picsumUrl('education-campus', 1200, 800),
  'healthcare/medical':        picsumUrl('medical-doctor', 1200, 800),
  'fashion/clothing':          picsumUrl('fashion-runway', 1200, 800),
  'travel/hospitality':        picsumUrl('travel-tropical-beach', 1200, 800),
  'law firm/legal':            picsumUrl('hero-office-modern', 1200, 800),
  'construction/architecture': picsumUrl('hero-office-modern', 1200, 800),
  'personal portfolio':        picsumUrl('hero-coding', 1200, 800),
  'creative agency':           picsumUrl('hero-gradient-purple', 1200, 800),
  'blog/media':                picsumUrl('blog-writing', 1200, 800),
  'nonprofit/charity':         picsumUrl('people-friends', 1200, 800),
  'event/conference':          picsumUrl('people-concert', 1200, 800),
  'crypto/web3':               picsumUrl('hero-tech-dark', 1200, 800),
  'B2B/service':               picsumUrl('hero-team-meeting', 1200, 800),
  'productivity/tool':         picsumUrl('hero-coding', 1200, 800),
  'AI/chatbot':                picsumUrl('technology-robot', 1200, 800),
  'food/delivery':             picsumUrl('food-burger', 1200, 800),
  'music/podcast':             picsumUrl('people-concert', 1200, 800),
};

// ─── Background Alternation Pattern ───────────────────────────────────────────
// Skip HeaderNav, FooterSection, AnnouncementBar — only apply to content sections.

const SKIP_BG_TYPES = new Set([
  'HeaderNav', 'FooterSection', 'AnnouncementBar',
  'Spacer', 'Blank', 'Flex', 'Grid', 'ColumnsLayout',
]);

/**
 * Alternating background pattern for content sections.
 * Creates visual rhythm without being monotonous.
 */
const BG_CYCLE = [
  undefined,       // 0: transparent (hero usually has its own bg)
  undefined,       // 1: transparent
  'muted',         // 2: subtle contrast
  undefined,       // 3: transparent
  undefined,       // 4: transparent
  'muted',         // 5: subtle contrast
] as const;

// ─── Core Engine ──────────────────────────────────────────────────────────────

/**
 * Extract a ColorPalette from raw styleguide colors (fallback when no designGuidance).
 */
function extractPaletteFromStyleguide(
  raw: { primary?: string; secondary?: string; accent?: string } | string | undefined,
): ColorPalette | undefined {
  if (!raw) return undefined;
  const c = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, string>;
  if (!c.primary) return undefined;
  return {
    primary: c.primary,
    onPrimary: c.onPrimary ?? '#FFFFFF',
    secondary: c.secondary ?? c.primary,
    accent: c.accent ?? c.primary,
    onAccent: c.onAccent ?? '#FFFFFF',
    background: c.background ?? '#ffffff',
    foreground: c.text ?? c.foreground ?? '#000000',
    card: c.surface ?? '#ffffff',
    muted: c.muted ?? '#f1f5f9',
    mutedForeground: c.textMuted ?? '#64748b',
    border: c.border ?? '#e2e8f0',
    note: '',
  };
}

/**
 * Apply intelligent defaults to AI-generated components.
 *
 * This is the main entry point — call it after AI output validation,
 * before emitting SSE events.
 *
 * Rules:
 * 1. Never overwrite a prop the AI already set
 * 2. Inject gradients from color palette when available
 * 3. Fill missing hero backgrounds from business type
 * 4. Fill missing testimonial avatars
 * 5. Alternate section backgrounds for visual rhythm
 */
export function applyComponentDefaults(
  components: ComponentData[],
  ctx: DefaultsContext = {},
): ComponentData[] {
  const palette = ctx.designGuidance?.colorPalette ?? extractPaletteFromStyleguide(ctx.styleguideColors);

  // Phase 1: Per-component defaults + gradient injection + image fill
  let result = components.map((comp) => {
    const props = { ...comp.props } as Props;
    const defaults = COMPONENT_DEFAULTS[comp.type];

    // 1a. Merge per-type defaults (never overwrite)
    if (defaults) {
      for (const [key, value] of Object.entries(defaults)) {
        if (props[key] === undefined || props[key] === null) {
          props[key] = value;
        }
      }
    }

    // 1b. Inject designStyle from design guidance
    if (!props.designStyle && ctx.designGuidance?.reasoning?.stylePriority) {
      props.designStyle = mapStylePriorityToDesignStyle(ctx.designGuidance.reasoning.stylePriority);
    }

    // 1c. Inject gradients from palette
    if (palette) {
      injectGradients(comp.type, props, palette, ctx.businessType);
    }

    // 1c. Fill missing hero background
    if (comp.type === 'HeroSection' && !props.backgroundUrl && ctx.businessType) {
      const bg = HERO_BACKGROUNDS[ctx.businessType]
        ?? Object.entries(HERO_BACKGROUNDS).find(([key]) => ctx.businessType!.toLowerCase().includes(key.split('/')[0]))?.[1];
      if (bg) {
        props.backgroundUrl = bg;
        props.backgroundOverlay = true;
      }
    }

    // 1d. Fill missing testimonial avatars
    if (comp.type === 'TestimonialSection' && Array.isArray(props.testimonials)) {
      fillTestimonialAvatars(props.testimonials as Array<Record<string, unknown>>);
    }

    // 1e. Fill missing team member avatars
    if (comp.type === 'TeamSection' && Array.isArray(props.members)) {
      fillTeamAvatars(props.members as Array<Record<string, unknown>>);
    }

    // 1f. Fill missing gallery images
    if (comp.type === 'Gallery' && (!Array.isArray(props.images) || (props.images as unknown[]).length === 0)) {
      fillGalleryImages(props, ctx.businessType);
    }

    // 1g. Fill missing product card images
    if (comp.type === 'ProductCards' && Array.isArray(props.products)) {
      fillProductImages(props.products as Array<Record<string, unknown>>, ctx.businessType);
    }

    // 1h. Fill missing blog post images
    if (comp.type === 'BlogSection' && Array.isArray(props.posts)) {
      fillBlogImages(props.posts as Array<Record<string, unknown>>, ctx.businessType);
    }

    // 1i. Fill missing FeatureShowcase image
    if (comp.type === 'FeatureShowcase' && !props.imageUrl) {
      props.imageUrl = getStockImage(ctx.businessType, 'showcase');
    }

    // 1j. HeroSection: map buttonText → ctaText, ensure ctaHref
    if (comp.type === 'HeroSection') {
      if (props.buttonText && !props.ctaText) {
        props.ctaText = props.buttonText;
        delete props.buttonText;
      }
      if (props.ctaText && !props.ctaHref) {
        props.ctaHref = '#';
      }
    }

    // 1k. Clean up non-rendering props left by AI plan phase
    if (props.purpose) delete props.purpose;

    // 1l. Fill missing HeaderNav content (logo, links, CTA)
    if (comp.type === 'HeaderNav' && (!Array.isArray(props.links) || props.links.length === 0)) {
      fillHeaderNavContent(props, ctx.businessType, ctx.businessName);
    }

    // 1m. Fill missing FooterSection content (logo, linkGroups, copyright)
    if (comp.type === 'FooterSection' && (!Array.isArray(props.linkGroups) || props.linkGroups.length === 0)) {
      fillFooterContent(props, ctx.businessType, ctx.businessName);
    }

    // 1n. Fix TestimonialSection field names (AI often outputs text/name/avatar instead of quote/author/avatarUrl)
    if (comp.type === 'TestimonialSection' && Array.isArray(props.testimonials)) {
      for (const t of props.testimonials as Array<Record<string, unknown>>) {
        if (t.text && !t.quote) { t.quote = t.text; delete t.text; }
        if (t.name && !t.author) { t.author = t.name; delete t.name; }
        if (t.avatar && !t.avatarUrl) { t.avatarUrl = t.avatar; delete t.avatar; }
      }
    }

    // 1o. Fill missing TestimonialSection testimonials
    if (comp.type === 'TestimonialSection' && (!Array.isArray(props.testimonials) || props.testimonials.length === 0)) {
      fillTestimonialContent(props);
    }

    // 1p. Fill missing ContactForm fields
    if (comp.type === 'ContactForm' && !props.description) {
      props.description = 'We\'d love to hear from you. Reach out with any questions.';
    }

    return { type: comp.type, props } as unknown as ComponentData;
  });

  // Phase 2: Alternate backgrounds across content sections
  result = alternateBackgrounds(result);

  return result;
}

// ─── Gradient Injection ───────────────────────────────────────────────────────

// ─── Business-Type Specific Badges ──────────────────────────────────────────

const BUSINESS_BADGES: Record<string, string> = {
  'SaaS': 'Trusted by 10,000+ teams',
  'e-commerce': 'Free Shipping Over $50',
  'restaurant': 'Reserve Your Table',
  'fitness': 'Start Your Free Trial',
  'real estate': 'Featured Listings',
  'education': 'Enroll Now — Limited Spots',
  'healthcare': 'Book Online — 24/7',
  'travel': 'Best Price Guarantee',
  'law firm': 'Free Consultation',
  'creative': 'Award-Winning Studio',
  'crypto': 'Trusted by 1M+ Users',
  'bakery': 'Fresh Daily',
  'coffee': 'Locally Roasted',
};

function getBusinessBadge(businessType?: string): string {
  if (!businessType) return 'New';
  const match = Object.entries(BUSINESS_BADGES).find(([key]) =>
    businessType.toLowerCase().includes(key.toLowerCase())
  );
  return match?.[1] ?? 'New';
}

function injectGradients(type: string, props: Props, palette: ColorPalette, businessType?: string): void {
  if (type === 'HeroSection') {
    if (!props.gradientFrom) props.gradientFrom = palette.primary;
    if (!props.gradientTo) props.gradientTo = palette.accent;
    // Ensure hero has a compelling badge
    if (!props.badge) {
      props.badge = getBusinessBadge(businessType);
    }
  } else if (type === 'CTASection') {
    if (!props.gradientFrom) props.gradientFrom = palette.primary;
    if (!props.gradientTo) props.gradientTo = palette.accent;
  }
}

// ─── Background Alternation ──────────────────────────────────────────────────

function alternateBackgrounds(components: ComponentData[]): ComponentData[] {
  let contentIndex = 0;

  return components.map((comp) => {
    // Skip non-content components
    if (SKIP_BG_TYPES.has(comp.type)) return comp;

    // Don't override if AI already set a background
    const props = comp.props as Props;
    if (props.bgColor || props.background) {
      contentIndex++;
      return comp;
    }

    // HeroSection always keeps its own styling
    if (comp.type === 'HeroSection') {
      contentIndex++;
      return comp;
    }

    const bgValue = BG_CYCLE[contentIndex % BG_CYCLE.length];
    contentIndex++;

    if (bgValue) {
      return {
        type: comp.type,
        props: { ...props, bgColor: bgValue as string },
      } as unknown as ComponentData;
    }

    return comp;
  });
}

// ─── Image Fill Helpers ──────────────────────────────────────────────────────

function fillTestimonialAvatars(testimonials: Array<Record<string, unknown>>): void {
  testimonials.forEach((t, i) => {
    if (!t.avatarUrl || typeof t.avatarUrl !== 'string' || t.avatarUrl.trim() === '') {
      t.avatarUrl = picsumUrl(`testimonial-avatar-${i}`, 100, 100);
    }
  });
}

function fillTeamAvatars(members: Array<Record<string, unknown>>): void {
  members.forEach((m, i) => {
    if (!m.avatarUrl || typeof m.avatarUrl !== 'string' || m.avatarUrl.trim() === '') {
      m.avatarUrl = picsumUrl(`team-person-${i}`, 200, 200);
    }
  });
}

// ─── Business Type → Stock Image Category Mapping ────────────────────────────

const GALLERY_STOCK: Record<string, string[]> = {
  'restaurant/dining': [0,1,2,3,4,5].map(i => picsumUrl(`food-restaurant-${i}`, 800, 600)),
  'bakery/pastry shop': [0,1,2,3,4,5].map(i => picsumUrl(`food-bakery-${i}`, 800, 600)),
  'coffee shop/cafe': [0,1,2,3,4,5].map(i => picsumUrl(`drink-cafe-${i}`, 800, 600)),
  'fitness/gym': [0,1,2,3,4,5].map(i => picsumUrl(`fitness-gym-${i}`, 800, 600)),
  'real estate': [0,1,2,3,4,5].map(i => picsumUrl(`realestate-${i}`, 1200, 800)),
  'travel/hospitality': [0,1,2,3,4,5].map(i => picsumUrl(`travel-${i}`, 1200, 800)),
  'fashion/clothing': [0,1,2,3,4,5].map(i => picsumUrl(`fashion-${i}`, 600, 800)),
  default: [0,1,2,3,4,5].map(i => picsumUrl(`gallery-default-${i}`, 800, 600)),
};

function getGalleryStock(businessType?: string): string[] {
  if (!businessType) return GALLERY_STOCK.default;
  const match = Object.entries(GALLERY_STOCK).find(([key]) =>
    businessType.toLowerCase().includes(key.split('/')[0])
  );
  return match?.[1] ?? GALLERY_STOCK.default;
}

function getStockImage(businessType?: string, purpose?: string): string {
  const images = getGalleryStock(businessType);
  if (purpose === 'showcase') return images[0];
  return images[Math.floor(Math.random() * images.length)];
}

function fillGalleryImages(props: Props, businessType?: string): void {
  const stock = getGalleryStock(businessType);
  const heading = (props.heading as string) || 'Gallery';
  props.images = stock.map((src, i) => ({
    src,
    alt: `${heading} image ${i + 1}`,
    caption: undefined,
  }));
}

function fillProductImages(products: Array<Record<string, unknown>>, businessType?: string): void {
  const stock = getGalleryStock(businessType);
  products.forEach((p, i) => {
    if (!p.imageUrl || typeof p.imageUrl !== 'string' || p.imageUrl.trim() === '') {
      p.imageUrl = stock[i % stock.length];
    }
  });
}

function fillBlogImages(posts: Array<Record<string, unknown>>, businessType?: string): void {
  const stock = getGalleryStock(businessType);
  posts.forEach((p, i) => {
    if (!p.imageUrl || typeof p.imageUrl !== 'string' || p.imageUrl.trim() === '') {
      p.imageUrl = stock[i % stock.length];
    }
  });
}

// ─── Rich Content Defaults (when AI polish fails) ──────────────────────────

function fillHeaderNavContent(props: Props, businessType?: string, businessName?: string): void {
  const name = businessName || inferBusinessName(businessType);
  if (!props.logo) props.logo = name;
  if (!Array.isArray(props.links) || props.links.length === 0) {
    props.links = [
      { label: 'Home', href: '#' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ];
  }
  if (!props.ctaText) props.ctaText = 'Get Started';
  if (!props.ctaHref) props.ctaHref = '#contact';
}

function fillFooterContent(props: Props, businessType?: string, businessName?: string): void {
  const name = businessName || inferBusinessName(businessType);
  if (!props.logo) props.logo = name;
  if (!props.description) {
    props.description = `Welcome to ${name}. We're dedicated to providing exceptional service and quality.`;
  }
  if (!Array.isArray(props.linkGroups) || props.linkGroups.length === 0) {
    props.linkGroups = [
      {
        title: 'Quick Links',
        links: [
          { label: 'Home', href: '#' },
          { label: 'About Us', href: '#about' },
          { label: 'Services', href: '#services' },
          { label: 'Contact', href: '#contact' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQ', href: '#faq' },
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
        ],
      },
    ];
  }
  if (!props.copyright) {
    props.copyright = `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
  }
}

function fillTestimonialContent(props: Props): void {
  if (!Array.isArray(props.testimonials) || props.testimonials.length === 0) {
    props.testimonials = [
      { quote: 'Absolutely love this place! The quality and service are outstanding.', author: 'Sarah M.', role: 'Verified Customer', avatarUrl: picsumUrl('testimonial-default-0', 100, 100), rating: 5 },
      { quote: "Best experience I've had. Highly recommend to everyone.", author: 'James K.', role: 'Regular Visitor', avatarUrl: picsumUrl('testimonial-default-1', 100, 100), rating: 5 },
      { quote: 'Fantastic from start to finish. Will definitely be coming back!', author: 'Emily R.', role: 'Happy Customer', avatarUrl: picsumUrl('testimonial-default-2', 100, 100), rating: 4 },
    ];
  }
}

function inferBusinessName(businessType?: string): string {
  if (!businessType) return 'Our Business';
  return businessType.split(/[\s/]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
