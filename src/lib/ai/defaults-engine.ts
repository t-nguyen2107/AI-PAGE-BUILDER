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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DefaultsContext {
  businessType?: string;
  designGuidance?: DesignGuidance;
}

type Props = Record<string, unknown>;

// ─── Per-Component Default Props ──────────────────────────────────────────────
// These are merged only when the AI did NOT set the prop.

const COMPONENT_DEFAULTS: Record<string, Props> = {
  HeroSection: {
    animation: 'fade-up',
    backgroundOverlay: true,
    padding: '96px',
    align: 'center',
  },
  FeaturesGrid: {
    animation: 'stagger',
    cardStyle: 'elevated',
    hoverEffect: 'lift',
    columns: 3,
  },
  TestimonialSection: {
    animation: 'stagger-fade',
    variant: 'carousel',
  },
  CTASection: {
    animation: 'fade-up',
    variant: 'gradient',
  },
  PricingTable: {
    animation: 'stagger',
  },
  FAQSection: {
    animation: 'fade-up',
  },
  StatsSection: {
    animation: 'fade-up',
    animated: true,
    columns: 4,
  },
  ContactForm: {
    animation: 'fade-up',
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
  'SaaS/technology': '/stock/hero/tech-dark.webp',
  'e-commerce/store': '/stock/fashion/shopping-bags.webp',
  'e-commerce/luxury': '/stock/fashion/fashion-show.webp',
  'restaurant/dining': '/stock/food/meal-table.webp',
  'bakery/pastry shop': '/stock/food/pancakes.webp',
  'coffee shop/cafe': '/stock/drink/coffee-shop.webp',
  'spa/wellness': '/stock/lifestyle/spa-relax.webp',
  'fitness/gym': '/stock/fitness/gym-workout.webp',
  'real estate': '/stock/realestate/luxury-home.webp',
  'education/training': '/stock/education/campus.webp',
  'healthcare/medical': '/stock/medical/doctor.webp',
  'fashion/clothing': '/stock/fashion/runway.webp',
  'travel/hospitality': '/stock/travel/tropical-beach.webp',
  'law firm/legal': '/stock/hero/office-modern.webp',
  'construction/architecture': '/stock/hero/office-modern.webp',
  'personal portfolio': '/stock/hero/coding-screen.webp',
  'creative agency': '/stock/hero/gradient-purple.webp',
  'blog/media': '/stock/blog/writing.webp',
  'nonprofit/charity': '/stock/people/friends-laughing.webp',
  'event/conference': '/stock/people/concert-crowd.webp',
  'crypto/web3': '/stock/hero/tech-dark.webp',
  'B2B/service': '/stock/hero/team-meeting.webp',
  'productivity/tool': '/stock/hero/coding-screen.webp',
  'AI/chatbot': '/stock/technology/robot-ai.webp',
  'food/delivery': '/stock/food/burger.webp',
  'music/podcast': '/stock/people/concert-crowd.webp',
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
  const palette = ctx.designGuidance?.colorPalette;

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

    // 1b. Inject gradients from palette
    if (palette) {
      injectGradients(comp.type, props, palette);
    }

    // 1c. Fill missing hero background
    if (comp.type === 'HeroSection' && !props.backgroundUrl && ctx.businessType) {
      const bg = HERO_BACKGROUNDS[ctx.businessType];
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

    return { type: comp.type, props } as unknown as ComponentData;
  });

  // Phase 2: Alternate backgrounds across content sections
  result = alternateBackgrounds(result);

  return result;
}

// ─── Gradient Injection ───────────────────────────────────────────────────────

function injectGradients(type: string, props: Props, palette: ColorPalette): void {
  if (type === 'HeroSection') {
    if (!props.gradientFrom) props.gradientFrom = palette.primary;
    if (!props.gradientTo) props.gradientTo = palette.accent;
  } else if (type === 'CTASection') {
    if (!props.gradientFrom) props.gradientFrom = palette.primary;
    if (!props.gradientTo) props.gradientTo = palette.secondary;
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
      t.avatarUrl = `/stock/testimonials/avatar-${(i % 4) + 1}.webp`;
    }
  });
}

function fillTeamAvatars(members: Array<Record<string, unknown>>): void {
  members.forEach((m, i) => {
    if (!m.avatarUrl || typeof m.avatarUrl !== 'string' || m.avatarUrl.trim() === '') {
      m.avatarUrl = `/stock/team/person-${(i % 6) + 1}.webp`;
    }
  });
}
