/**
 * Shared Component Catalog — single source of truth for all component metadata.
 *
 * Used by:
 *  - system-prompt.ts (tiered catalog builder)
 *  - template-prompt.ts (compact props reference)
 *  - output.ts, template-schema.ts (VALID_COMPONENT_TYPES)
 */

export interface ComponentInfo {
  description: string;
  shortDescription: string;
  propsSignature: string;
  /** Recommended default props the AI should include when generating this component */
  recommendedDefaults?: string;
}

export const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  HeroSection: {
    description: 'Hero banner with heading, subtext, CTA buttons, optional background image.',
    shortDescription: 'Hero banner with heading and CTA buttons',
    propsSignature: 'heading (string), subtext (string), badge (string?), ctaText (string), ctaHref (string), ctaSecondaryText (string?), ctaSecondaryHref (string?), align ("left"|"center"), backgroundUrl (string?), backgroundOverlay (boolean), padding ("48px"|"96px"|"128px")',
    recommendedDefaults: 'compelling heading stating value prop in 6-10 words, badge: short 2-4 word credibility label, ctaText: action verb phrase',
  },
  FeaturesGrid: {
    description: 'Grid of feature cards with icons, titles, descriptions.',
    shortDescription: 'Feature cards in a responsive grid',
    propsSignature: 'heading (string), subtext (string?), columns (2|3|4), features (array of {title, description, icon?})',
    recommendedDefaults: '4-6 features with specific titles (not generic "Fast"/"Secure"), each with 1-2 sentence description of concrete benefit, icon on every feature',
  },
  PricingTable: {
    description: 'Pricing tier cards with feature lists and CTA buttons.',
    shortDescription: 'Pricing plans with feature comparison',
    propsSignature: 'heading (string), subtext (string?), plans (array of {name, price, period, description, features: array of {value}, ctaText, ctaHref, highlighted: boolean})',
    recommendedDefaults: '3 tiers with middle highlighted, realistic feature lists per tier, yearlyPlans with 15-20% discount',
  },
  TestimonialSection: {
    description: 'Testimonial cards with quotes and author info.',
    shortDescription: 'Customer testimonials with quotes',
    propsSignature: 'heading (string?), testimonials (array of {quote, author, role, avatarUrl?})',
    recommendedDefaults: '3-4 testimonials with specific measurable results (e.g. "reduced costs by 40%"), author with real-sounding name + role',
  },
  CTASection: {
    description: 'Call-to-action section with heading, subtext, and button.',
    shortDescription: 'Call-to-action with heading and button',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), backgroundUrl (string?)',
    recommendedDefaults: 'action-oriented heading, ctaText: verb phrase (e.g. "Get Started Today")',
  },
  FAQSection: {
    description: 'FAQ with expandable question/answer items.',
    shortDescription: 'Frequently asked questions accordion',
    propsSignature: 'heading (string), subtext (string?), items (array of {question, answer})',
    recommendedDefaults: '5-6 items with actionable answers ending with a reassuring next step',
  },
  StatsSection: {
    description: 'Statistics counter section.',
    shortDescription: 'Statistics counter display',
    propsSignature: 'heading (string?), stats (array of {value, label}), columns (2|3|4)',
    recommendedDefaults: '4 stats with believable non-round values (e.g. "10,000+" not "10K") and short 2-4 word labels',
  },
  TeamSection: {
    description: 'Team member cards with avatars.',
    shortDescription: 'Team member cards with roles',
    propsSignature: 'heading (string), subtext (string?), members (array of {name, role, avatarUrl?})',
    recommendedDefaults: '3-4 members with specific role titles (not generic "Team Member"), use avatarUrls from https://picsum.photos/seed/team-{n}/200/200',
  },
  BlogSection: {
    description: 'Blog post cards grid.',
    shortDescription: 'Blog post preview cards',
    propsSignature: 'heading (string), posts (array of {title, excerpt, imageUrl?, date, href}), columns (2|3)',
    recommendedDefaults: '3 posts with realistic dates, click-worthy titles, and 2-line excerpts',
  },
  LogoGrid: {
    description: 'Logo/partner grid with images.',
    shortDescription: 'Partner/client logo grid',
    propsSignature: 'heading (string?), logos (array of {name, imageUrl})',
    recommendedDefaults: '5-6 logos with realistic company names',
  },
  ContactForm: {
    description: 'Contact form section.',
    shortDescription: 'Contact form with fields',
    propsSignature: 'heading (string), subtext (string?), showPhone (boolean), showCompany (boolean), buttonText (string)',
    recommendedDefaults: 'buttonText: "Send Message" or "Book a Demo", heading: action-oriented, subtext mentioning response time',
  },
  HeaderNav: {
    description: 'Navigation bar with logo, links, and CTA.',
    shortDescription: 'Site header navigation bar',
    propsSignature: 'logo (string), links (array of {label, href}), ctaText (string?), ctaHref (string?), sticky (boolean)',
    recommendedDefaults: '4-5 links with labels matching page section headings, logo: business name, ctaText: primary action verb phrase',
  },
  FooterSection: {
    description: 'Multi-column footer with links.',
    shortDescription: 'Multi-column site footer',
    propsSignature: 'logo (string?), description (string?), linkGroups (array of {title, links: array of {label, href}}), copyright (string?)',
    recommendedDefaults: '3-4 linkGroups mirroring HeaderNav, copyright with current year, description: 1-sentence company mission',
  },
  TextBlock: {
    description: 'Rich text content block.',
    shortDescription: 'Rich text content block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right"), maxWidth ("sm"|"md"|"lg"|"xl"|"full")',
    recommendedDefaults: 'align: "left", maxWidth: "md" for body text, "lg" for wider content',
  },
  ImageBlock: {
    description: 'Single image with optional styling.',
    shortDescription: 'Single image with styling options',
    propsSignature: 'src (string), alt (string), width (string?), borderRadius ("none"|"sm"|"md"|"lg"|"full")',
    recommendedDefaults: 'alt: descriptive text for accessibility',
  },
  Spacer: {
    description: 'Vertical spacing element.',
    shortDescription: 'Vertical spacing element',
    propsSignature: 'height (number, 8-200)',
    recommendedDefaults: 'height: 48 for standard section gap, 96 for dramatic separation',
  },
  ColumnsLayout: {
    description: 'Multi-column layout with slot-based content.',
    shortDescription: 'Multi-column layout container',
    propsSignature: 'columns (2|3|4), gap (number)',
    recommendedDefaults: 'columns: 2, gap: 24 for side-by-side content',
  },
  NewsletterSignup: {
    description: 'Email subscription section with heading and button.',
    shortDescription: 'Email subscription form',
    propsSignature: 'heading (string), subtext (string?), buttonText (string), placeholder (string?)',
    recommendedDefaults: 'subtext with specific value proposition (not generic "stay updated"), buttonText: action phrase',
  },
  Gallery: {
    description: 'Image gallery grid with lightbox-style layout.',
    shortDescription: 'Image gallery grid',
    propsSignature: 'heading (string?), images (array of {src, alt}), columns (2|3|4)',
    recommendedDefaults: '6+ images with descriptive alt text',
  },
  SocialProof: {
    description: 'Trust indicators with stats or user counts.',
    shortDescription: 'Trust indicators and social proof',
    propsSignature: 'heading (string), stats (array of {value, label})',
    recommendedDefaults: '3-4 trust indicators with specific numbers',
  },
  ComparisonTable: {
    description: 'Side-by-side plan/feature comparison.',
    shortDescription: 'Feature comparison matrix',
    propsSignature: 'heading (string), plans (array of {name, features: array of {value}})',
    recommendedDefaults: '2-3 plans compared, 6-8 features with specific values',
  },
  ProductCards: {
    description: 'Product showcase cards with prices.',
    shortDescription: 'Product cards with pricing',
    propsSignature: 'heading (string?), products (array of {title, price, image, href, description?}), columns (2|3|4)',
    recommendedDefaults: '4-6 products with realistic names, prices, and descriptions',
  },
  FeatureShowcase: {
    description: 'Split-layout feature highlight with image + details.',
    shortDescription: 'Split image + feature layout',
    propsSignature: 'heading (string), description (string?), image (string), features (array of {title, description})',
    recommendedDefaults: '2-3 features with specific titles, image: relevant photo',
  },
  CountdownTimer: {
    description: 'Countdown timer in events/offers.',
    shortDescription: 'Countdown timer widget',
    propsSignature: 'heading (string), endDate (string,ISO date)',
    recommendedDefaults: 'endDate: 7-30 days in the future, heading: urgency-driven',
  },
  AnnouncementBar: {
    description: 'Top announcement bar with message and optional CTA.',
    shortDescription: 'Top announcement bar',
    propsSignature: 'message (string), ctaText (string?), ctaHref (string?), variant ("primary"|"dark"|"gradient")',
    recommendedDefaults: 'message: under 50 chars, include ctaText',
  },
  Banner: {
    description: 'Full-width banner with heading, subtext, and CTA.',
    shortDescription: 'Full-width promotional banner',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), variant ("info"|"warning"|"success"|"gradient")',
    recommendedDefaults: 'heading: concise action-oriented text, ctaText: short verb phrase',
  },
  HeadingBlock: {
    description: 'Standalone heading element.',
    shortDescription: 'Standalone heading element',
    propsSignature: 'text (string), level (1|2|3|4|5|6), align ("left"|"center"|"right")',
    recommendedDefaults: 'level: 2 for section titles, align: "center", text: concise (3-8 words)',
  },
  RichTextBlock: {
    description: 'Advanced rich text with formatting.',
    shortDescription: 'Advanced rich text block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right")',
    recommendedDefaults: 'align: "left", content: well-structured HTML with semantic tags',
  },
  ButtonBlock: {
    description: 'Standalone button element.',
    shortDescription: 'Standalone button element',
    propsSignature: 'label (string), href (string), variant ("primary"|"outline"|"ghost")',
    recommendedDefaults: 'variant: "primary", label: short action phrase (2-4 words)',
  },
  CardBlock: {
    description: 'Card container with title and content.',
    shortDescription: 'Card container with content',
    propsSignature: 'title (string), content (string), image (string?)',
    recommendedDefaults: 'title: 3-6 words, content: 2-3 sentences',
  },
  SectionBlock: {
    description: 'Wrapper section with background and padding.',
    shortDescription: 'Section wrapper with background',
    propsSignature: 'background ("white"|"muted"|"dark"|"gradient"), padding ("sm"|"md"|"lg")',
    recommendedDefaults: 'background: "muted" to create visual separation, padding: "lg"',
  },
  Blank: {
    description: 'Empty container for free-form content.',
    shortDescription: 'Empty container',
    propsSignature: '(none)',
    recommendedDefaults: 'Use as a structural placeholder or divider',
  },
  Flex: {
    description: 'Flex layout container.',
    shortDescription: 'Flexbox layout container',
    propsSignature: 'direction ("row"|"column"), gap (number), align ("start"|"center"|"end")',
    recommendedDefaults: 'direction: "row", gap: 16, align: "center"',
  },
  Grid: {
    description: 'CSS Grid container.',
    shortDescription: 'CSS Grid container',
    propsSignature: 'columns (number), gap (number)',
    recommendedDefaults: 'columns: 2 or 3, gap: 24',
  },
  CustomSection: {
    description: 'Renders raw HTML with Tailwind CSS classes. Use for unique, creative layouts that don\'t fit other component types. AI generates full HTML with Tailwind classes — unlimited design freedom.',
    shortDescription: 'Custom HTML/Tailwind section for unique designs',
    propsSignature: 'html (string — full HTML with Tailwind classes), css? (string — optional scoped CSS), preview? (string — short description), minHeight? (string — default "200px")',
    recommendedDefaults: 'preview: short 3-5 word description, html: well-structured semantic HTML with Tailwind utilities',
  },
};

/** Set of all valid Puck component type names — derived from catalog keys. */
export const VALID_COMPONENT_TYPES: ReadonlySet<string> = new Set(Object.keys(COMPONENT_CATALOG));
