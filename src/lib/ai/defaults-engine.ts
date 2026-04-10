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
import { normalizeComponentType } from './prompts/component-catalog';
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
    backgroundOverlay: true,
    padding: '128px',
    align: 'center',
    layout: 'centered',
  },
  FeaturesGrid: {
    cardStyle: 'elevated',
    hoverEffect: 'lift',
    columns: 3,
  },
  TestimonialSection: {
    variant: 'grid',
  },
  CTASection: {
    variant: 'gradient',
  },
  PricingTable: {
    highlightedBadge: 'Most Popular',
  },
  FAQSection: {},
  StatsSection: {
    animated: true,
    columns: 4,
    cardStyle: 'gradient',
  },
  ContactForm: {
    showPhone: true,
    showCompany: true,
  },
  Gallery: {
    columns: 3,
  },
  ProductCards: {
    hoverEffect: 'lift',
    columns: 3,
  },
  TeamSection: {},
  BlogSection: {
    columns: 3,
  },
  FeatureShowcase: {},
  LogoGrid: {},
  NewsletterSignup: {},
  SocialProof: {},
  Banner: {
    variant: 'gradient',
  },
  ComparisonTable: {},
  CountdownTimer: {},
  AnnouncementBar: {
    variant: 'gradient',
  },
  // Structural components
  HeaderNav: { sticky: true },
  FooterSection: {},
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
  // ─── Generic keyword fallbacks (first-word match) ────────────────
  'insurance':                 picsumUrl('hero-office-modern', 1200, 800),
  'farm':                      picsumUrl('realestate-luxury-home', 1200, 800),
  'agriculture':               picsumUrl('realestate-luxury-home', 1200, 800),
  'automotive':                picsumUrl('hero-tech-dark', 1200, 800),
  'consulting':                picsumUrl('hero-team-meeting', 1200, 800),
  'manufacturing':             picsumUrl('hero-office-modern', 1200, 800),
  'logistics':                 picsumUrl('hero-tech-dark', 1200, 800),
  'pharmaceutical':            picsumUrl('medical-doctor', 1200, 800),
  'energy':                    picsumUrl('hero-tech-dark', 1200, 800),
  'mining':                    picsumUrl('hero-office-modern', 1200, 800),
  'telecommunications':        picsumUrl('hero-tech-dark', 1200, 800),
  'government':                picsumUrl('hero-office-modern', 1200, 800),
  'automobile':                picsumUrl('hero-tech-dark', 1200, 800),
  'pet':                       picsumUrl('lifestyle-spa', 1200, 800),
  'veterinary':                picsumUrl('lifestyle-spa', 1200, 800),
  'cleaning':                  picsumUrl('hero-office-modern', 1200, 800),
  'plumbing':                  picsumUrl('hero-office-modern', 1200, 800),
  'landscaping':               picsumUrl('realestate-luxury-home', 1200, 800),
  'pest':                      picsumUrl('realestate-luxury-home', 1200, 800),
  'moving':                    picsumUrl('hero-team-meeting', 1200, 800),
  'roofing':                   picsumUrl('hero-office-modern', 1200, 800),
  'painting':                  picsumUrl('hero-office-modern', 1200, 800),
  'electrical':                picsumUrl('hero-tech-dark', 1200, 800),
  'hvac':                      picsumUrl('hero-tech-dark', 1200, 800),
  'security':                  picsumUrl('hero-tech-dark', 1200, 800),
  'marketing':                 picsumUrl('hero-team-meeting', 1200, 800),
  'accounting':                picsumUrl('hero-office-modern', 1200, 800),
  'legal':                     picsumUrl('hero-office-modern', 1200, 800),
  'dental':                    picsumUrl('medical-doctor', 1200, 800),
  'therapy':                   picsumUrl('lifestyle-spa', 1200, 800),
  'photography':               picsumUrl('hero-gradient-purple', 1200, 800),
  'design':                    picsumUrl('hero-gradient-purple', 1200, 800),
  'interior':                  picsumUrl('realestate-luxury-home', 1200, 800),
  'tattoo':                    picsumUrl('hero-gradient-purple', 1200, 800),
  'barber':                    picsumUrl('lifestyle-spa', 1200, 800),
  'salon':                     picsumUrl('lifestyle-spa', 1200, 800),
  'car':                       picsumUrl('hero-tech-dark', 1200, 800),
  'dealer':                    picsumUrl('hero-tech-dark', 1200, 800),
  'mortgage':                  picsumUrl('hero-office-modern', 1200, 800),
  'financial':                 picsumUrl('hero-office-modern', 1200, 800),
  'church':                    picsumUrl('people-friends', 1200, 800),
  'school':                    picsumUrl('education-campus', 1200, 800),
  'charity':                   picsumUrl('people-friends', 1200, 800),
  'wedding':                   picsumUrl('people-friends', 1200, 800),
  'gaming':                    picsumUrl('hero-tech-dark', 1200, 800),
  'sports':                    picsumUrl('fitness-gym', 1200, 800),
  'yoga':                      picsumUrl('lifestyle-spa', 1200, 800),
  'meditation':                picsumUrl('lifestyle-spa', 1200, 800),
  'wine':                      picsumUrl('food-meal-table', 1200, 800),
  'brewery':                   picsumUrl('drink-coffee-shop', 1200, 800),
  'grocery':                   picsumUrl('food-meal-table', 1200, 800),
  'storage':                   picsumUrl('hero-office-modern', 1200, 800),
  'transport':                 picsumUrl('hero-tech-dark', 1200, 800),
  'recruiting':                picsumUrl('hero-team-meeting', 1200, 800),
  'hr':                        picsumUrl('hero-team-meeting', 1200, 800),
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
  'var(--muted)',  // 2: subtle contrast (CSS variable for valid inline style)
  undefined,       // 3: transparent
  undefined,       // 4: transparent
  'var(--muted)',  // 5: subtle contrast
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
    const type = normalizeComponentType(comp.type);
    const props = { ...comp.props } as Props;
    const defaults = COMPONENT_DEFAULTS[type];

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
      injectGradients(type, props, palette, ctx.businessType);
    }

    // 1c. Fill missing hero background
    if (type === 'HeroSection' && !props.backgroundUrl && ctx.businessType) {
      const bg = HERO_BACKGROUNDS[ctx.businessType]
        ?? Object.entries(HERO_BACKGROUNDS).find(([key]) => ctx.businessType!.toLowerCase().includes(key.split('/')[0]))?.[1];
      if (bg) {
        props.backgroundUrl = bg;
        props.backgroundOverlay = true;
      }
    }

    // 1d. Fill missing testimonial avatars
    if (type === 'TestimonialSection' && Array.isArray(props.testimonials)) {
      fillTestimonialAvatars(props.testimonials as Array<Record<string, unknown>>);
    }

    // 1e. Fill missing team member avatars
    if (type === 'TeamSection' && Array.isArray(props.members)) {
      fillTeamAvatars(props.members as Array<Record<string, unknown>>);
    }

    // 1f. Fill missing gallery images
    if (type === 'Gallery' && (!Array.isArray(props.images) || (props.images as unknown[]).length === 0)) {
      fillGalleryImages(props, ctx.businessType);
    }

    // 1g. Fill missing product card images
    if (type === 'ProductCards' && Array.isArray(props.products)) {
      fillProductImages(props.products as Array<Record<string, unknown>>, ctx.businessType);
    }

    // 1h. Fill missing blog post images
    if (type === 'BlogSection' && Array.isArray(props.posts)) {
      fillBlogImages(props.posts as Array<Record<string, unknown>>, ctx.businessType);
    }

    // 1i. Fill missing FeatureShowcase image
    if (type === 'FeatureShowcase' && !props.imageUrl) {
      props.imageUrl = getStockImage(ctx.businessType, 'showcase');
    }

    // 1j. HeroSection: map buttonText → ctaText, ensure ctaHref
    if (type === 'HeroSection') {
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

    // 1k2. CTASection: fill background image when variant needs visual punch
    if (type === 'CTASection' && !props.backgroundUrl && props.variant === 'default' && ctx.businessType) {
      const bg = HERO_BACKGROUNDS[ctx.businessType]
        ?? Object.entries(HERO_BACKGROUNDS).find(([key]) => ctx.businessType!.toLowerCase().includes(key.split('/')[0]))?.[1];
      if (bg) {
        props.backgroundUrl = bg;
      }
    }

    // 1l. Fill missing HeaderNav content (logo, links, CTA)
    if (type === 'HeaderNav' && (!Array.isArray(props.links) || props.links.length === 0)) {
      fillHeaderNavContent(props, ctx.businessType, ctx.businessName);
    }

    // 1m. Fill missing FooterSection content (logo, linkGroups, copyright)
    if (type === 'FooterSection' && (!Array.isArray(props.linkGroups) || props.linkGroups.length === 0)) {
      fillFooterContent(props, ctx.businessType, ctx.businessName);
    }

    // 1n. Fix TestimonialSection field names (AI often outputs text/name/avatar instead of quote/author/avatarUrl)
    if (type === 'TestimonialSection' && Array.isArray(props.testimonials)) {
      for (const t of props.testimonials as Array<Record<string, unknown>>) {
        if (t.text && !t.quote) { t.quote = t.text; delete t.text; }
        if (t.name && !t.author) { t.author = t.name; delete t.name; }
        if (t.avatar && !t.avatarUrl) { t.avatarUrl = t.avatar; delete t.avatar; }
        if (t.image && !t.avatarUrl) { t.avatarUrl = t.image; delete t.image; }
      }
    }

    // 1o. Fill missing LogoGrid logos with text-based defaults
    if (type === 'LogoGrid' && (!Array.isArray(props.logos) || (props.logos as unknown[]).length === 0)) {
      props.logos = fillLogoGridDefaults(ctx.businessName);
    }

    // 1o. Fill missing TestimonialSection testimonials
    if (type === 'TestimonialSection' && (!Array.isArray(props.testimonials) || props.testimonials.length === 0)) {
      fillTestimonialContent(props);
    }

    // 1p. Fill missing ContactForm fields
    if (type === 'ContactForm' && !props.description) {
      props.description = 'We\'d love to hear from you. Reach out with any questions.';
    }

    // 1q. FeaturesGrid: auto-fix columns when count doesn't divide evenly
    //     4 items with 3 cols = ugly 3+1 layout → use 4 or 2 cols instead
    if (type === 'FeaturesGrid' && Array.isArray(props.features)) {
      const count = (props.features as unknown[]).length;
      if (count > 0 && typeof props.columns === 'number' && count % props.columns !== 0) {
        // Prefer 4 cols for 4 items, 2 cols for 2 items, else match count
        if (count === 4) props.columns = 4;
        else if (count === 2) props.columns = 2;
        else if (count <= 4) props.columns = count;
      }
      // Fill missing feature icons with default check icon
      for (const f of props.features as Array<Record<string, unknown>>) {
        if (!f.icon && !f.imageUrl) {
          f.icon = 'check_circle';
        }
      }
    }

    return { type, props } as unknown as ComponentData;
  });

  // Phase 2: Alternate backgrounds across content sections
  result = alternateBackgrounds(result);

  // Phase 3: Enforce structural rhythm (avoid consecutive same-layout sections)
  result = enforceStructuralRhythm(result);

  // Phase 4: Prevent text-fatigue (break up consecutive text-heavy sections)
  result = preventTextFatigue(result);

  return result;
}

// ─── Phase 3: Structural Rhythm ──────────────────────────────────────────────

type LayoutFamily = 'centered' | 'split' | 'grid' | 'full-width' | 'structural';

const LAYOUT_FAMILY_DEFAULTS: Record<string, LayoutFamily> = {
  HeroSection: 'centered',
  FeaturesGrid: 'grid',
  PricingTable: 'grid',
  TestimonialSection: 'grid',
  CTASection: 'centered',
  FAQSection: 'centered',
  StatsSection: 'grid',
  TeamSection: 'grid',
  BlogSection: 'grid',
  LogoGrid: 'grid',
  ContactForm: 'centered',
  FeatureShowcase: 'split',
  Gallery: 'grid',
  NewsletterSignup: 'centered',
  ComparisonTable: 'grid',
  ProductCards: 'grid',
  SocialProof: 'grid',
  CountdownTimer: 'centered',
  Banner: 'full-width',
  AnnouncementBar: 'structural',
  HeaderNav: 'structural',
  FooterSection: 'structural',
  TextBlock: 'centered',
  ImageBlock: 'full-width',
  Spacer: 'structural',
};

/** Resolve the actual layout family from component type + props. */
function resolveLayoutFamily(type: string, props: Props): LayoutFamily {
  if (SKIP_BG_TYPES.has(type)) return 'structural';

  switch (type) {
    case 'HeroSection':
      if (props.backgroundUrl || props.videoUrl) return 'full-width';
      if (props.layout === 'split-left' || props.layout === 'split-right') return 'split';
      return 'centered';
    case 'CTASection':
      if (props.layout === 'split') return 'split';
      if (props.backgroundUrl) return 'full-width';
      return 'centered';
    default:
      return LAYOUT_FAMILY_DEFAULTS[type] ?? 'centered';
  }
}

/** Mutations to break same-layout monotony. */
const LAYOUT_MUTATIONS: Record<string, Array<(props: Props) => void>> = {
  HeroSection: [
    (p) => { if (!p.layout || p.layout === 'centered') p.layout = 'split-left'; },
    (p) => { if (!p.layout || p.layout === 'centered') p.layout = 'split-right'; },
  ],
  CTASection: [
    (p) => { if (!p.layout || p.layout === 'centered') p.layout = 'split'; },
    (p) => { if (p.layout === 'centered') { p.variant = 'dark'; } },
  ],
  FeaturesGrid: [
    (p) => { if (p.columns === 3) p.columns = 4; else if (p.columns === 4) p.columns = 3; },
    (p) => { p.cardStyle = p.cardStyle === 'elevated' ? 'flat' : 'elevated'; },
  ],
  FeatureShowcase: [
    (p) => { p.imagePosition = p.imagePosition === 'left' ? 'right' : 'left'; },
  ],
  StatsSection: [
    (p) => { p.cardStyle = p.cardStyle === 'gradient' ? 'bordered' : 'gradient'; },
    (p) => { if (p.columns === 4) p.columns = 3; else if (p.columns === 3) p.columns = 4; },
  ],
  PricingTable: [
    (_p) => { /* pricing layout is fixed, use bg contrast instead */ },
  ],
  TestimonialSection: [
    (_p) => { /* testimonial grid is fixed, rely on bg contrast */ },
  ],
  BlogSection: [
    (p) => { if (p.columns === 3) p.columns = 2; else if (p.columns === 2) p.columns = 3; },
  ],
};

/**
 * Detect consecutive sections with the same layout family and mutate
 * the middle one to create visual rhythm. Zero LLM cost.
 */
function enforceStructuralRhythm(components: ComponentData[]): ComponentData[] {
  // Build layout family map
  const families = components.map((comp) => {
    const props = comp.props as Props;
    return resolveLayoutFamily(comp.type, props);
  });

  // Find runs of same-family content sections (length >= 2)
  const result = components.map((comp) => ({ ...comp, props: { ...(comp.props as Props) } })) as unknown as ComponentData[];

  for (let i = 0; i < result.length; i++) {
    if (families[i] === 'structural') continue;

    // Look ahead: is this the start of a 3+ run of same layout?
    if (i + 2 < result.length
      && families[i] !== 'structural'
      && families[i] === families[i + 1]
      && families[i + 1] === families[i + 2]) {
      // Mutate the middle section (i+1)
      const midComp = result[i + 1];
      const midType = midComp.type;
      const midProps = midComp.props as Props;
      const mutations = LAYOUT_MUTATIONS[midType];

      if (mutations && mutations.length > 0) {
        // Pick a mutation that actually changes something
        const mutationIndex = (i + 1) % mutations.length;
        mutations[mutationIndex](midProps);
        // Skip past this run
        i += 2;
      }
    }

    // Also check for 2 consecutive same-family (mutate the second if it has mutations)
    if (i + 1 < result.length
      && families[i] !== 'structural'
      && families[i] === families[i + 1]) {
      const secComp = result[i + 1];
      const secType = secComp.type;
      const secProps = secComp.props as Props;
      const mutations = LAYOUT_MUTATIONS[secType];

      if (mutations && mutations.length > 0) {
        const mutationIndex = i % mutations.length;
        mutations[mutationIndex](secProps);
        i += 1;
      }
    }
  }

  return result;
}

// ─── Phase 4: Text-Fatigue Prevention ────────────────────────────────────────

const TEXT_HEAVY_TYPES = new Set([
  'FAQSection', 'TextBlock', 'RichTextBlock', 'BlogSection', 'ComparisonTable',
]);

/**
 * Detect consecutive text-heavy sections and make them more visually varied.
 * Does NOT insert new sections (preserves AI's structural intent).
 */
function preventTextFatigue(components: ComponentData[]): ComponentData[] {
  const result = components.map((comp) => ({ ...comp, props: { ...(comp.props as Props) } })) as unknown as ComponentData[];

  let consecutiveText = 0;

  for (let i = 0; i < result.length; i++) {
    const comp = result[i];
    const props = comp.props as Props;

    if (SKIP_BG_TYPES.has(comp.type)) continue;

    if (TEXT_HEAVY_TYPES.has(comp.type)) {
      consecutiveText++;

      // After 2 consecutive text-heavy sections, apply visual breaks
      if (consecutiveText >= 2) {
        // Strategy 1: Force visual card style on blog sections
        if (comp.type === 'BlogSection' && props.columns !== 2) {
          props.columns = 2;
        }

        // Strategy 2: Give text sections contrasting backgrounds
        if (!props.bgColor) {
          props.bgColor = consecutiveText % 2 === 0 ? 'var(--muted)' : undefined;
        }

        // Strategy 3: Limit FAQ items to prevent text walls
        if (comp.type === 'FAQSection' && Array.isArray(props.items) && props.items.length > 5) {
          props.items = (props.items as unknown[]).slice(0, 5);
        }
      }
    } else {
      consecutiveText = 0;
    }
  }

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

function injectGradients(type: string, props: Props, _palette: ColorPalette, businessType?: string): void {
  if (type === 'HeroSection') {
    // HeroSection now uses CSS variables (var(--primary), var(--accent)) as gradient default.
    // Only inject gradientFrom/gradientTo if the AI explicitly set them (user override case).
    // Ensure hero has a compelling badge
    if (!props.badge) {
      props.badge = getBusinessBadge(businessType);
    }
  }
  // CTASection uses bg-primary Tailwind class (resolves to CSS vars) — no hex injection needed.
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

/** Default text-based logos when AI provides none */
function fillLogoGridDefaults(businessName?: string): Array<{ name: string; imageUrl: string }> {
  const brands = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises'];
  return brands.map(name => ({ name, imageUrl: '' }));
}
