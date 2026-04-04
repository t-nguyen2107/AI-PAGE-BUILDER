/**
 * Auto-generate human-readable component names from type + content hints.
 *
 * Convention: {type_prefix}_{content_hint}
 * Examples:
 *   HeroSection + heading "Welcome"     → hero_welcome
 *   FeaturesGrid + heading "Our Services" → features_our_services
 *   HeadingBlock + text "About Us"       → heading_about_us
 *   ButtonBlock + label "Get Started"    → button_get_started
 */

const TYPE_PREFIXES: Record<string, string> = {
  HeroSection: "hero",
  FeaturesGrid: "features",
  PricingTable: "pricing",
  TestimonialSection: "testimonials",
  CTASection: "cta",
  FAQSection: "faq",
  StatsSection: "stats",
  TeamSection: "team",
  BlogSection: "blog",
  LogoGrid: "logos",
  ContactForm: "contact",
  HeaderNav: "header",
  FooterSection: "footer",
  TextBlock: "text",
  ImageBlock: "image",
  Spacer: "spacer",
  ColumnsLayout: "columns",
  NewsletterSignup: "newsletter",
  Gallery: "gallery",
  SocialProof: "social_proof",
  ComparisonTable: "comparison",
  ProductCards: "products",
  FeatureShowcase: "showcase",
  CountdownTimer: "countdown",
  AnnouncementBar: "announcement",
  Banner: "banner",
  ButtonBlock: "button",
  CardBlock: "card",
  HeadingBlock: "heading",
  RichTextBlock: "richtext",
  Blank: "blank",
  Flex: "flex",
  Grid: "grid",
  SectionBlock: "section",
  CustomSection: "custom",
};

/** Props to extract content hints from, in priority order */
const CONTENT_PROPS = [
  "heading",
  "title",
  "label",
  "question",
  "text",
  "subtext",
  "content",
  "quote",
  "name",
  "description",
] as const;

/**
 * Slugify a string into snake_case, max `maxLen` chars.
 * Removes non-alphanumeric, collapses spaces/underscores.
 */
function slugify(text: string, maxLen = 30): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/[\s_]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, maxLen);
}

/**
 * Extract a content hint from component props.
 * Checks heading → title → label → question → text → etc.
 */
function extractContentHint(props: Record<string, unknown>): string {
  for (const key of CONTENT_PROPS) {
    const val = props[key];
    if (typeof val === "string" && val.trim().length > 0) {
      return slugify(val.trim());
    }
  }
  return "";
}

/**
 * Auto-generate a component name from its type and props.
 *
 * @param type - Component type string (e.g. "HeroSection")
 * @param props - Component props (checked for content hints)
 * @param index - Optional position index for disambiguation
 * @returns A human-readable name like "hero_welcome" or "features_1"
 */
export function autoNameComponent(
  type: string,
  props?: Record<string, unknown>,
  index?: number,
): string {
  const prefix = TYPE_PREFIXES[type] ?? slugify(type);

  const hint = props ? extractContentHint(props) : "";

  if (hint) {
    return `${prefix}_${hint}`;
  }

  if (index !== undefined) {
    return `${prefix}_${index + 1}`;
  }

  return prefix;
}
