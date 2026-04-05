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
  /** Tips on which variants/props to choose based on context */
  variantTips?: string;
}

export const COMPONENT_CATALOG: Record<string, ComponentInfo> = {
  HeroSection: {
    description: 'Hero banner with heading, subtext, CTA buttons, optional background image.',
    shortDescription: 'Hero banner with heading and CTA buttons',
    propsSignature: 'heading (string), subtext (string), badge (string?), ctaText (string), ctaHref (string), ctaSecondaryText (string?), ctaSecondaryHref (string?), align ("left"|"center"), backgroundUrl (string?), backgroundOverlay (boolean), padding ("48px"|"96px"|"128px")',
    recommendedDefaults: 'animation: "fade-up", padding: "96px", badge: short text above heading, ctaSecondaryText: "Learn More"',
    variantTips: 'SaaS: centered + gradient. E-commerce: split-left/with image. Restaurant: split-right + food image. Fitness: dark gradient + bold heading. Portfolio: centered + minimal.',
  },
  FeaturesGrid: {
    description: 'Grid of feature cards with icons, titles, descriptions.',
    shortDescription: 'Feature cards in a responsive grid',
    propsSignature: 'heading (string), subtext (string?), columns (2|3|4), features (array of {title, description, icon?})',
    recommendedDefaults: 'columns: 3, cardStyle: "elevated", hoverEffect: "lift", animation: "stagger"',
    variantTips: 'SaaS: cardStyle="icon" with analytics/shield/zap icons. E-commerce: cardStyle="image" with product images. Creative: cardStyle="flat" with bold typography. Use 4-6 features, not 3.',
  },
  PricingTable: {
    description: 'Pricing tier cards with feature lists and CTA buttons.',
    shortDescription: 'Pricing plans with feature comparison',
    propsSignature: 'heading (string), subtext (string?), plans (array of {name, price, period, description, features: array of {value}, ctaText, ctaHref, highlighted: boolean})',
    recommendedDefaults: 'highlightedBadge: "Most Popular", pricingToggle: true with yearlyPlans (20% discount), animation: "stagger"',
    variantTips: 'Always include 3 tiers. Highlight middle tier. Include yearly discount. SaaS: per-seat pricing. E-commerce: free/pro/enterprise. Restaurant: simple 2-tier.',
  },
  TestimonialSection: {
    description: 'Testimonial cards with quotes and author info.',
    shortDescription: 'Customer testimonials with quotes',
    propsSignature: 'heading (string?), testimonials (array of {quote, author, role, avatarUrl?})',
    recommendedDefaults: 'animation: "stagger-fade", variant: "carousel"',
    variantTips: 'SaaS: carousel variant with headshot avatars. Restaurant: grid with food quotes. Agency: masonry layout. Always use 3-4 testimonials with full names + real company names.',
  },
  CTASection: {
    description: 'Call-to-action section with heading, subtext, and button.',
    shortDescription: 'Call-to-action with heading and button',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), backgroundUrl (string?)',
    recommendedDefaults: 'animation: "fade-up", variant: "gradient"',
    variantTips: 'SaaS: variant="gradient" with urgency text. E-commerce: variant="dark" with discount offer. Use gradientFrom/gradientTo for brand colors. Add subtext with compelling benefit.',
  },
  FAQSection: {
    description: 'FAQ with expandable question/answer items.',
    shortDescription: 'Frequently asked questions accordion',
    propsSignature: 'heading (string), subtext (string?), items (array of {question, answer})',
    recommendedDefaults: 'animation: "fade-up", 4-6 items',
    variantTips: 'SaaS: pricing, security, integration FAQs. Restaurant: reservations, dietary, hours. Always include 4-6 genuine questions with specific answers. Match business type concerns.',
  },
  StatsSection: {
    description: 'Statistics counter section.',
    shortDescription: 'Statistics counter display',
    propsSignature: 'heading (string?), stats (array of {value, label}), columns (2|3|4)',
    recommendedDefaults: 'animated: true, columns: 4, animation: "fade-up"',
    variantTips: 'SaaS: "10K+ users, 99.9% uptime, 50M+ API calls, 150+ integrations". Restaurant: "15+ years, 200K dishes served, 4.9 rating, 3 locations". Use 4 stats. Impressive but believable numbers.',
  },
  TeamSection: {
    description: 'Team member cards with avatars.',
    shortDescription: 'Team member cards with roles',
    propsSignature: 'heading (string), subtext (string?), members (array of {name, role, avatarUrl?})',
    recommendedDefaults: '3-4 members, animation: "stagger"',
    variantTips: 'Agency/Law: full leadership team with titles. Startup: 3-4 founders with roles. Healthcare: doctors with specialties. Use realistic names and specific role titles.',
  },
  BlogSection: {
    description: 'Blog post cards grid.',
    shortDescription: 'Blog post preview cards',
    propsSignature: 'heading (string), posts (array of {title, excerpt, imageUrl?, date, href}), columns (2|3)',
    recommendedDefaults: 'columns: 3, animation: "stagger"',
    variantTips: 'Blog/Media: 3 recent posts with thumbnails + dates. SaaS: "Latest from our blog" with tips articles. Use realistic titles and 2-line excerpts.',
  },
  LogoGrid: {
    description: 'Logo/partner grid with images.',
    shortDescription: 'Partner/client logo grid',
    propsSignature: 'heading (string?), logos (array of {name, imageUrl})',
    recommendedDefaults: '5-6 logos, animation: "fade-up"',
    variantTips: 'SaaS: "Trusted by" with tech company names. Agency: client logos. Use placeholder names like "TechCorp", "InnovateCo" if no real brands. Heading: "Trusted by leading companies".',
  },
  ContactForm: {
    description: 'Contact form section.',
    shortDescription: 'Contact form with fields',
    propsSignature: 'heading (string), subtext (string?), showPhone (boolean), showCompany (boolean), buttonText (string)',
    recommendedDefaults: 'showPhone: true, showCompany: true, buttonText: "Send Message"',
    variantTips: 'SaaS: showCompany + "Book a Demo". Restaurant: showPhone + "Reserve a Table". Healthcare: showPhone + "Request Appointment". Service businesses: show all fields.',
  },
  HeaderNav: {
    description: 'Navigation bar with logo, links, and CTA.',
    shortDescription: 'Site header navigation bar',
    propsSignature: 'logo (string), links (array of {label, href}), ctaText (string?), ctaHref (string?), sticky (boolean)',
    recommendedDefaults: 'sticky: true, 4-5 links matching page sections',
    variantTips: 'SaaS: "Get Started" CTA, links: Features/Pricing/About/Blog. Restaurant: "Reserve" CTA, links: Menu/Gallery/About/Contact. E-commerce: "Shop Now" CTA. Always match links to sections on the page.',
  },
  FooterSection: {
    description: 'Multi-column footer with links.',
    shortDescription: 'Multi-column site footer',
    propsSignature: 'logo (string?), description (string?), linkGroups (array of {title, links: array of {label, href}}), copyright (string?)',
    recommendedDefaults: '3-4 linkGroups (Product, Company, Support, Legal), dark background, copyright with current year',
    variantTips: 'SaaS: Product/Resources/Company/Legal columns. Restaurant: Menu/Locations/About/Contact. Always include logo description and copyright. Match nav links in footer.',
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
    recommendedDefaults: 'buttonText: "Subscribe", placeholder: "Enter your email", animation: "fade-up"',
    variantTips: 'SaaS/Blog: "Get weekly tips" with value proposition. E-commerce: "Get 10% off" with discount incentive. Always include compelling subtext explaining the benefit.',
  },
  Gallery: {
    description: 'Image gallery grid with lightbox-style layout.',
    shortDescription: 'Image gallery grid',
    propsSignature: 'heading (string?), images (array of {src, alt}), columns (2|3|4)',
    recommendedDefaults: 'columns: 3, animation: "stagger"',
    variantTips: 'Restaurant/Food: 6-8 appetizing food photos. Real estate: property showcase. Portfolio: project screenshots. Travel: destination photos. Use 6+ images for visual impact.',
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
    recommendedDefaults: 'columns: 3, hoverEffect: "lift", animation: "stagger"',
    variantTips: 'E-commerce: 4-6 products with prices, "Add to Cart" feel. Fashion: hoverEffect="zoom" with lifestyle images. Food: columns: 3 with appetizing descriptions. Always include price and image.',
  },
  FeatureShowcase: {
    description: 'Split-layout feature highlight with image + details.',
    shortDescription: 'Split image + feature layout',
    propsSignature: 'heading (string), description (string?), image (string), features (array of {title, description})',
    recommendedDefaults: 'animation: "fade-up", 2-3 features with icons',
    variantTips: 'SaaS: screenshot + feature list. Real estate: property photo + highlights. Education: classroom image + program details. Use high-quality relevant images.',
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
    recommendedDefaults: 'variant: "gradient", include ctaText with link',
    variantTips: 'E-commerce: "Free shipping over $50" + "Shop Now". SaaS: "New feature launched" + "Try it". Event: early bird discount with deadline. Keep message under 60 chars.',
  },
  Banner: {
    description: 'Full-width banner with heading, subtext, and CTA.',
    shortDescription: 'Full-width promotional banner',
    propsSignature: 'heading (string), subtext (string?), ctaText (string), ctaHref (string), variant ("info"|"warning"|"success"|"gradient")',
    recommendedDefaults: 'variant: "gradient", animation: "fade-up"',
    variantTips: 'Promo: variant="gradient" with urgency heading. Event: variant="info" with date + "Register". Sale: variant="success" with discount. Keep text concise and action-oriented.',
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
    recommendedDefaults: 'Use for unique sections: timelines, process steps, map embeds, video backgrounds, comparison sliders',
    variantTips: 'When no standard component fits: process/timeline, interactive maps, video hero, before/after comparison. Use Tailwind utility classes extensively. Include preview description for editor.',
  },
};

/** Set of all valid Puck component type names — derived from catalog keys. */
export const VALID_COMPONENT_TYPES: ReadonlySet<string> = new Set(Object.keys(COMPONENT_CATALOG));
