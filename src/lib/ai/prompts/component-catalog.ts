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
}

export const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  HeroSection: {
    description: 'Hero banner with heading, subtext, CTA buttons, optional background image.',
    shortDescription: 'Hero banner with heading and CTA buttons',
    propsSignature: 'heading (string), subtext (string), badge (string?), ctaText (string), ctaHref (string), ctaSecondaryText (string?), ctaSecondaryHref (string?), align ("left"|"center"), backgroundUrl (string?), backgroundOverlay (boolean), padding ("48px"|"96px"|"128px")',
  },
  FeaturesGrid: {
    description: 'Grid of feature cards with icons, titles, descriptions.',
    shortDescription: 'Feature cards in a responsive grid',
    propsSignature: 'heading (string), subtext (string?), columns (2|3|4), features (array of {title, description, icon?})',
  },
  PricingTable: {
    description: 'Pricing tier cards with feature lists and CTA buttons.',
    shortDescription: 'Pricing plans with feature comparison',
    propsSignature: 'heading (string), subtext (string?), plans (array of {name, price, period, description, features: array of {value}, ctaText, ctaHref, highlighted: boolean})',
  },
  TestimonialSection: {
    description: 'Testimonial cards with quotes and author info.',
    shortDescription: 'Customer testimonials with quotes',
    propsSignature: 'heading (string?), testimonials (array of {quote, author, role, avatarUrl?})',
  },
  CTASection: {
    description: 'Call-to-action section with heading, subtext, and button.',
    shortDescription: 'Call-to-action with heading and button',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), backgroundUrl (string?)',
  },
  FAQSection: {
    description: 'FAQ with expandable question/answer items.',
    shortDescription: 'Frequently asked questions accordion',
    propsSignature: 'heading (string), subtext (string?), items (array of {question, answer})',
  },
  StatsSection: {
    description: 'Statistics counter section.',
    shortDescription: 'Statistics counter display',
    propsSignature: 'heading (string?), stats (array of {value, label}), columns (2|3|4)',
  },
  TeamSection: {
    description: 'Team member cards with avatars.',
    shortDescription: 'Team member cards with roles',
    propsSignature: 'heading (string), subtext (string?), members (array of {name, role, avatarUrl?})',
  },
  BlogSection: {
    description: 'Blog post cards grid.',
    shortDescription: 'Blog post preview cards',
    propsSignature: 'heading (string), posts (array of {title, excerpt, imageUrl?, date, href}), columns (2|3)',
  },
  LogoGrid: {
    description: 'Logo/partner grid with images.',
    shortDescription: 'Partner/client logo grid',
    propsSignature: 'heading (string?), logos (array of {name, imageUrl})',
  },
  ContactForm: {
    description: 'Contact form section.',
    shortDescription: 'Contact form with fields',
    propsSignature: 'heading (string), subtext (string?), showPhone (boolean), showCompany (boolean), buttonText (string)',
  },
  HeaderNav: {
    description: 'Navigation bar with logo, links, and CTA.',
    shortDescription: 'Site header navigation bar',
    propsSignature: 'logo (string), links (array of {label, href}), ctaText (string?), ctaHref (string?), sticky (boolean)',
  },
  FooterSection: {
    description: 'Multi-column footer with links.',
    shortDescription: 'Multi-column site footer',
    propsSignature: 'logo (string?), description (string?), linkGroups (array of {title, links: array of {label, href}}), copyright (string?)',
  },
  TextBlock: {
    description: 'Rich text content block.',
    shortDescription: 'Rich text content block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right"), maxWidth ("sm"|"md"|"lg"|"xl"|"full")',
  },
  ImageBlock: {
    description: 'Single image with optional styling.',
    shortDescription: 'Single image with styling options',
    propsSignature: 'src (string), alt (string), width (string?), borderRadius ("none"|"sm"|"md"|"lg"|"full")',
  },
  Spacer: {
    description: 'Vertical spacing element.',
    shortDescription: 'Vertical spacing element',
    propsSignature: 'height (number, 8-200)',
  },
  ColumnsLayout: {
    description: 'Multi-column layout with slot-based content.',
    shortDescription: 'Multi-column layout container',
    propsSignature: 'columns (2|3|4), gap (number)',
  },
  NewsletterSignup: {
    description: 'Email subscription section with heading and button.',
    shortDescription: 'Email subscription form',
    propsSignature: 'heading (string), subtext (string?), buttonText (string), placeholder (string?)',
  },
  Gallery: {
    description: 'Image gallery grid with lightbox-style layout.',
    shortDescription: 'Image gallery grid',
    propsSignature: 'heading (string?), images (array of {src, alt}), columns (2|3|4)',
  },
  SocialProof: {
    description: 'Trust indicators with stats or user counts.',
    shortDescription: 'Trust indicators and social proof',
    propsSignature: 'heading (string), stats (array of {value, label})',
  },
  ComparisonTable: {
    description: 'Side-by-side plan/feature comparison.',
    shortDescription: 'Feature comparison matrix',
    propsSignature: 'heading (string), plans (array of {name, features: array of {value}})',
  },
  ProductCards: {
    description: 'Product showcase cards with prices.',
    shortDescription: 'Product cards with pricing',
    propsSignature: 'heading (string?), products (array of {title, price, image, href, description?}), columns (2|3|4)',
  },
  FeatureShowcase: {
    description: 'Split-layout feature highlight with image + details.',
    shortDescription: 'Split image + feature layout',
    propsSignature: 'heading (string), description (string?), image (string), features (array of {title, description})',
  },
  CountdownTimer: {
    description: 'Countdown timer in events/offers.',
    shortDescription: 'Countdown timer widget',
    propsSignature: 'heading (string), endDate (string,ISO date)',
  },
  AnnouncementBar: {
    description: 'Top announcement bar with message and optional CTA.',
    shortDescription: 'Top announcement bar',
    propsSignature: 'message (string), ctaText (string?), ctaHref (string?), variant ("primary"|"dark"|"gradient")',
  },
  Banner: {
    description: 'Full-width banner with heading, subtext, and CTA.',
    shortDescription: 'Full-width promotional banner',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), variant ("info"|"warning"|"success"|"gradient")',
  },
  HeadingBlock: {
    description: 'Standalone heading element.',
    shortDescription: 'Standalone heading element',
    propsSignature: 'text (string), level (1|2|3|4|5|6), align ("left"|"center"|"right")',
  },
  RichTextBlock: {
    description: 'Advanced rich text with formatting.',
    shortDescription: 'Advanced rich text block',
    propsSignature: 'content (HTML string), align ("left"|"center"|"right")',
  },
  ButtonBlock: {
    description: 'Standalone button element.',
    shortDescription: 'Standalone button element',
    propsSignature: 'label (string), href (string), variant ("primary"|"outline"|"ghost")',
  },
  CardBlock: {
    description: 'Card container with title and content.',
    shortDescription: 'Card container with content',
    propsSignature: 'title (string), content (string), image (string?)',
  },
  SectionBlock: {
    description: 'Wrapper section with background and padding.',
    shortDescription: 'Section wrapper with background',
    propsSignature: 'background ("white"|"muted"|"dark"|"gradient"), padding ("sm"|"md"|"lg")',
  },
  Blank: {
    description: 'Empty container for free-form content.',
    shortDescription: 'Empty container',
    propsSignature: '(none)',
  },
  Flex: {
    description: 'Flex layout container.',
    shortDescription: 'Flexbox layout container',
    propsSignature: 'direction ("row"|"column"), gap (number), align ("start"|"center"|"end")',
  },
  Grid: {
    description: 'CSS Grid container.',
    shortDescription: 'CSS Grid container',
    propsSignature: 'columns (number), gap (number)',
  },
  CustomSection: {
    description: 'Renders raw HTML with Tailwind CSS classes. Use for unique, creative layouts that don\'t fit other component types. AI generates full HTML with Tailwind classes — unlimited design freedom.',
    shortDescription: 'Custom HTML/Tailwind section for unique designs',
    propsSignature: 'html (string — full HTML with Tailwind classes), css? (string — optional scoped CSS), preview? (string — short description), minHeight? (string — default "200px")',
  },
};

/** Set of all valid Puck component type names — derived from catalog keys. */
export const VALID_COMPONENT_TYPES: ReadonlySet<string> = new Set(Object.keys(COMPONENT_CATALOG));
